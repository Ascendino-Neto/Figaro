const db = require('../config/db');

const Agendamento = {
  // Criar novo agendamento
  create: (agendamentoData) => {
    const {
      cliente_id,
      prestador_id,
      servico_id,
      data_agendamento,
      valor_servico,
      observacoes
    } = agendamentoData;

    return new Promise((resolve, reject) => {
      // Primeiro valida se o serviço existe e está ativo
      const validarServicoQuery = `
        SELECT id, ativo FROM servicos 
        WHERE id = ? AND ativo = 1
      `;

      db.get(validarServicoQuery, [servico_id], (err, servico) => {
        if (err) {
          console.error('❌ Erro ao validar serviço:', err.message);
          return reject(new Error('Erro ao validar serviço'));
        }

        if (!servico) {
          return reject(new Error('Serviço não encontrado ou indisponível'));
        }

        // Agora cria o agendamento
        const insertQuery = `
          INSERT INTO agendamentos (
            cliente_id, prestador_id, servico_id, 
            data_agendamento, valor_servico, observacoes, status
          ) 
          VALUES (?, ?, ?, ?, ?, ?, 'agendado')
        `;

        const params = [
          cliente_id,
          prestador_id,
          servico_id,
          data_agendamento,
          valor_servico,
          observacoes || null
        ];

        console.log('💾 Salvando agendamento:', {
          cliente_id,
          prestador_id,
          servico_id,
          data_agendamento,
          valor_servico
        });

        db.run(insertQuery, params, function (err) {
          if (err) {
            console.error('❌ Erro ao criar agendamento:', err.message);
            
            if (err.message.includes('FOREIGN KEY constraint failed')) {
              return reject(new Error('Cliente, prestador ou serviço inválido'));
            }
            
            return reject(new Error('Erro ao criar agendamento no banco de dados'));
          }

          console.log('✅ Agendamento criado com ID:', this.lastID);

          // Busca o agendamento criado com informações completas
          const selectQuery = `
            SELECT 
              a.*,
              c.nome as cliente_nome,
              c.email as cliente_email,
              p.nome as prestador_nome,
              s.nome as servico_nome,
              s.descricao as servico_descricao
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            LEFT JOIN prestadores p ON a.prestador_id = p.id
            LEFT JOIN servicos s ON a.servico_id = s.id
            WHERE a.id = ?
          `;

          db.get(selectQuery, [this.lastID], (err, agendamentoCompleto) => {
            if (err) {
              console.error('❌ Erro ao buscar agendamento criado:', err.message);
              // Ainda assim retorna sucesso, mas sem os dados completos
              return resolve({
                id: this.lastID,
                message: 'Agendamento criado com sucesso, mas erro ao buscar detalhes'
              });
            }

            resolve(agendamentoCompleto);
          });
        });
      });
    });
  },

  // Buscar agendamento por ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          c.email as cliente_email,
          c.telefone as cliente_telefone,
          p.nome as prestador_nome,
          p.telefone as prestador_telefone,
          s.nome as servico_nome,
          s.descricao as servico_descricao,
          s.local_atendimento,
          s.tempo_duracao
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.id = ?
      `;

      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Buscar agendamentos por cliente
  findByClienteId: (cliente_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          p.nome as prestador_nome,
          s.nome as servico_nome,
          s.descricao as servico_descricao
        FROM agendamentos a
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.cliente_id = ?
        ORDER BY a.data_agendamento DESC
      `;

      db.all(query, [cliente_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Buscar agendamentos por prestador
  findByPrestadorId: (prestador_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          c.telefone as cliente_telefone,
          s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.prestador_id = ?
        ORDER BY a.data_agendamento DESC
      `;

      db.all(query, [prestador_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Atualizar status do agendamento
  updateStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      const statusValidos = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'ausente'];
      
      if (!statusValidos.includes(status)) {
        return reject(new Error('Status inválido'));
      }

      const query = `
        UPDATE agendamentos 
        SET status = ?, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      db.run(query, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ 
          updated: this.changes,
          message: `Status atualizado para: ${status}`
        });
      });
    });
  },

  // Verificar disponibilidade (evitar conflitos de horário)
  verificarDisponibilidade: (prestador_id, data_agendamento, duracao_minutos = 60) => {
    return new Promise((resolve, reject) => {
      const dataInicio = new Date(data_agendamento);
      const dataFim = new Date(dataInicio.getTime() + duracao_minutos * 60000);

      const query = `
        SELECT COUNT(*) as count
        FROM agendamentos 
        WHERE prestador_id = ? 
          AND status NOT IN ('cancelado', 'ausente')
          AND (
            (data_agendamento BETWEEN ? AND ?)
            OR (data_fim_previsto BETWEEN ? AND ?)
            OR (? BETWEEN data_agendamento AND data_fim_previsto)
          )
      `;

      const params = [
        prestador_id,
        data_agendamento,
        dataFim.toISOString(),
        data_agendamento,
        dataFim.toISOString(),
        data_agendamento
      ];

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve({ disponivel: row.count === 0 });
      });
    });
  },

  // Validar se serviço existe e está ativo
  validarServico: (servico_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT id, nome, ativo, prestador_id
        FROM servicos 
        WHERE id = ? AND ativo = 1
      `;

      db.get(query, [servico_id], (err, servico) => {
        if (err) reject(err);
        else if (!servico) {
          reject(new Error('Serviço não encontrado ou indisponível'));
        } else {
          resolve(servico);
        }
      });
    });
  },

  // Deletar agendamento (apenas se ainda não foi confirmado)
  delete: (id, cliente_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM agendamentos 
        WHERE id = ? AND cliente_id = ? AND status = 'agendado'
      `;

      db.run(query, [id, cliente_id], function (err) {
        if (err) reject(err);
        else resolve({ 
          deleted: this.changes,
          message: this.changes > 0 ? 'Agendamento cancelado' : 'Agendamento não encontrado ou já confirmado'
        });
      });
    });
  }
};

module.exports = Agendamento;