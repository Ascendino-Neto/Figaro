const db = require('../config/db');

const Agendamento = {
  // Criar novo agendamento (VERSÃO CORRIGIDA)
  create: async (agendamentoData) => {
    const {
      cliente_id,
      prestador_id,
      servico_id,
      data_agendamento,
      valor_servico,
      observacoes
    } = agendamentoData;

    try {
      // ✅ VALIDAÇÃO ESPECÍFICA DE CADA CHAVE ESTRANGEIRA
      console.log('🔍 Validando chaves estrangeiras...');

      // 1. Validar CLIENTE
      const clienteResult = await db.query('SELECT id, nome FROM clientes WHERE id = $1', [cliente_id]);
      if (clienteResult.rows.length === 0) {
        throw new Error(`Cliente com ID ${cliente_id} não encontrado`);
      }
      console.log(`   ✅ Cliente: ${clienteResult.rows[0].nome} (ID: ${cliente_id})`);

      // 2. Validar PRESTADOR
      const prestadorResult = await db.query('SELECT id, nome FROM prestadores WHERE id = $1', [prestador_id]);
      if (prestadorResult.rows.length === 0) {
        throw new Error(`Prestador com ID ${prestador_id} não encontrado`);
      }
      console.log(`   ✅ Prestador: ${prestadorResult.rows[0].nome} (ID: ${prestador_id})`);

      // 3. Validar SERVIÇO (ativo)
      const servicoResult = await db.query(
        'SELECT id, nome, ativo, tempo_duracao FROM servicos WHERE id = $1 AND ativo = true', 
        [servico_id]
      );
      if (servicoResult.rows.length === 0) {
        throw new Error(`Serviço com ID ${servico_id} não encontrado ou inativo`);
      }
      console.log(`   ✅ Serviço: ${servicoResult.rows[0].nome} (ID: ${servico_id})`);

      const servico = servicoResult.rows[0];
      const duracaoServico = servico.tempo_duracao || 60;

      // ✅ VERIFICAR DISPONIBILIDADE
      console.log('🕐 Verificando disponibilidade do horário...');
      const verificarDisponibilidadeQuery = `
        SELECT COUNT(*) as count
        FROM agendamentos 
        WHERE prestador_id = $1 
          AND status NOT IN ('cancelado', 'ausente')
          AND (
            (data_agendamento, data_agendamento + (tempo_duracao || ' minutes')::INTERVAL) 
            OVERLAPS ($2::TIMESTAMP, $2::TIMESTAMP + ($3 || ' minutes')::INTERVAL)
          )
      `;

      const disponibilidadeResult = await db.query(
        verificarDisponibilidadeQuery, 
        [prestador_id, data_agendamento, duracaoServico]
      );

      if (parseInt(disponibilidadeResult.rows[0].count) > 0) {
        throw new Error('Horário indisponível. Este horário já foi reservado.');
      }
      console.log('   ✅ Horário disponível');

      // ✅ CRIAR AGENDAMENTO
      const insertQuery = `
        INSERT INTO agendamentos (
          cliente_id, prestador_id, servico_id, 
          data_agendamento, valor_servico, observacoes, status,
          tempo_duracao
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, 'agendado', $7)
        RETURNING *
      `;

      const insertParams = [
        cliente_id,
        prestador_id,
        servico_id,
        data_agendamento,
        valor_servico,
        observacoes || null,
        duracaoServico
      ];

      console.log('💾 Salvando agendamento no PostgreSQL:', {
        cliente_id,
        prestador_id,
        servico_id,
        data_agendamento,
        valor_servico,
        duracaoServico
      });

      const insertResult = await db.query(insertQuery, insertParams);
      const agendamentoInserido = insertResult.rows[0];

      console.log('✅ Agendamento criado com ID:', agendamentoInserido.id);

      // ✅ BUSCAR DADOS COMPLETOS DO AGENDAMENTO
      const selectQuery = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          c.email as cliente_email,
          c.telefone as cliente_telefone,
          p.nome as prestador_nome,
          p.telefone as prestador_telefone,
          s.nome as servico_nome,
          s.descricao as servico_descricao,
          s.local_atendimento
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.id = $1
      `;

      const completeResult = await db.query(selectQuery, [agendamentoInserido.id]);
      
      if (completeResult.rows[0]) {
        console.log('🎉 Agendamento criado com sucesso!');
        return completeResult.rows[0];
      } else {
        console.log('⚠️ Agendamento criado, mas erro ao buscar detalhes completos');
        return agendamentoInserido;
      }

    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error.message);
      
      // ✅ TRATAMENTO ESPECÍFICO DE ERROS POSTGRESQL
      if (error.code === '23503') { // Foreign key violation
        // Já tratamos as FKs acima, mas se ainda der erro, é algo específico
        console.error('   🔍 Detalhe do erro FK:', error.detail);
        throw new Error('Erro de integridade referencial: ' + error.detail);
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Dados do agendamento inválidos: ' + error.message);
      }
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Conflito de dados: ' + error.message);
      }
      
      // Se for outro erro, propaga a mensagem original
      throw error;
    }
  },

  // Buscar horários disponíveis para um prestador
  getHorariosDisponiveis: async (prestador_id, servico_id, dias = 7) => {
    try {
      console.log('🕐 Buscando horários disponíveis para prestador:', prestador_id);
      
      // ✅ VALIDAR PRESTADOR
      const prestadorResult = await db.query('SELECT id, nome FROM prestadores WHERE id = $1', [prestador_id]);
      if (prestadorResult.rows.length === 0) {
        throw new Error(`Prestador com ID ${prestador_id} não encontrado`);
      }

      // ✅ VALIDAR SERVIÇO
      const servicoQuery = 'SELECT tempo_duracao FROM servicos WHERE id = $1 AND ativo = true';
      const servicoResult = await db.query(servicoQuery, [servico_id]);
      
      if (servicoResult.rows.length === 0) {
        throw new Error('Serviço não encontrado ou indisponível');
      }
      
      const duracaoServico = servicoResult.rows[0].tempo_duracao || 60;
      
      // Buscar agendamentos existentes do prestador
      const agendamentosQuery = `
        SELECT data_agendamento, tempo_duracao 
        FROM agendamentos 
        WHERE prestador_id = $1 
          AND status NOT IN ('cancelado', 'ausente')
          AND data_agendamento > NOW()
      `;
      
      const agendamentosResult = await db.query(agendamentosQuery, [prestador_id]);
      const agendamentos = agendamentosResult.rows;
      
      // Gerar horários disponíveis
      const dateUtils = require('../utils/DateUtils');
      const todosHorarios = dateUtils.gerarHorariosDisponiveis(
        prestador_id, 
        servico_id, 
        dias, 
        duracaoServico
      );
      
      // Filtrar horários que não conflitam com agendamentos existentes
      const horariosDisponiveis = todosHorarios.filter(horario => {
        const horarioFim = dateUtils.calcularHorarioTermino(horario, duracaoServico);
        
        // Verificar se há conflito com agendamentos existentes
        const temConflito = agendamentos.some(agendamento => {
          const agendamentoFim = dateUtils.calcularHorarioTermino(
            agendamento.data_agendamento, 
            agendamento.tempo_duracao || 60
          );
          
          return dateUtils.hasSobreposicao(
            horario,
            horarioFim,
            agendamento.data_agendamento,
            agendamentoFim
          );
        });
        
        return !temConflito && dateUtils.isExpediente(horario);
      });
      
      console.log(`✅ ${horariosDisponiveis.length} horários disponíveis encontrados`);
      
      return {
        horarios: horariosDisponiveis,
        total: horariosDisponiveis.length,
        duracao_servico: duracaoServico,
        prestador_nome: prestadorResult.rows[0].nome
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar horários disponíveis:', error.message);
      throw new Error('Erro interno ao buscar horários disponíveis: ' + error.message);
    }
  },

  // Buscar agendamento por ID
  findById: async (id) => {
    try {
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
        WHERE a.id = $1
      `;

      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar agendamento por ID:', error);
      throw error;
    }
  },

  // Buscar agendamentos por cliente
  findByClienteId: async (cliente_id) => {
    try {
      const query = `
        SELECT 
          a.*,
          p.nome as prestador_nome,
          s.nome as servico_nome,
          s.descricao as servico_descricao
        FROM agendamentos a
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.cliente_id = $1
        ORDER BY a.data_agendamento DESC
      `;

      const result = await db.query(query, [cliente_id]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos do cliente:', error);
      throw error;
    }
  },

  // Buscar agendamentos por prestador
  findByPrestadorId: async (prestador_id) => {
    try {
      const query = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          c.telefone as cliente_telefone,
          s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.prestador_id = $1
        ORDER BY a.data_agendamento DESC
      `;

      const result = await db.query(query, [prestador_id]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos do prestador:', error);
      throw error;
    }
  },

  // Atualizar status do agendamento
  updateStatus: async (id, status) => {
    const statusValidos = ['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'ausente'];
    
    if (!statusValidos.includes(status)) {
      throw new Error('Status inválido');
    }

    try {
      const query = `
        UPDATE agendamentos 
        SET status = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await db.query(query, [status, id]);
      
      if (result.rowCount === 0) {
        throw new Error('Agendamento não encontrado');
      }
      
      return { 
        updated: result.rowCount,
        message: `Status atualizado para: ${status}`,
        agendamento: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  },

  // Verificar disponibilidade
  verificarDisponibilidade: async (prestador_id, data_agendamento, duracao_minutos = 60) => {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM agendamentos 
        WHERE prestador_id = $1 
          AND status NOT IN ('cancelado', 'ausente')
          AND (
            (data_agendamento, data_agendamento + (tempo_duracao || ' minutes')::INTERVAL) 
            OVERLAPS ($2::TIMESTAMP, $2::TIMESTAMP + ($3 || ' minutes')::INTERVAL)
          )
      `;

      const result = await db.query(query, [prestador_id, data_agendamento, duracao_minutos]);
      
      return { disponivel: parseInt(result.rows[0].count) === 0 };
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade:', error);
      throw error;
    }
  },

  // Validar se serviço existe e está ativo
  validarServico: async (servico_id) => {
    try {
      const query = `
        SELECT id, nome, ativo, prestador_id, tempo_duracao
        FROM servicos 
        WHERE id = $1 AND ativo = true
      `;

      const result = await db.query(query, [servico_id]);
      
      if (result.rows.length === 0) {
        throw new Error('Serviço não encontrado ou indisponível');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao validar serviço:', error);
      throw error;
    }
  },

  // Deletar agendamento
  delete: async (id, cliente_id) => {
    try {
      const query = `
        DELETE FROM agendamentos 
        WHERE id = $1 AND cliente_id = $2 AND status = 'agendado'
      `;

      const result = await db.query(query, [id, cliente_id]);
      
      const message = result.rowCount > 0 
        ? 'Agendamento cancelado' 
        : 'Agendamento não encontrado ou já confirmado';
      
      return { 
        deleted: result.rowCount,
        message: message
      };
    } catch (error) {
      console.error('❌ Erro ao deletar agendamento:', error);
      throw error;
    }
  },

  // ✅ MÉTODOS ADICIONAIS

  // Buscar agendamentos por status
  findByStatus: async (status) => {
    try {
      const query = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          p.nome as prestador_nome,
          s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.status = $1
        ORDER BY a.data_agendamento ASC
      `;

      const result = await db.query(query, [status]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos por status:', error);
      throw error;
    }
  },

  // Buscar agendamentos futuros
  findFuturos: async (prestador_id = null) => {
    try {
      let query = `
        SELECT 
          a.*,
          c.nome as cliente_nome,
          p.nome as prestador_nome,
          s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN prestadores p ON a.prestador_id = p.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.data_agendamento > NOW()
      `;
      
      let params = [];
      
      if (prestador_id) {
        query += ' AND a.prestador_id = $1';
        params.push(prestador_id);
      }
      
      query += ' ORDER BY a.data_agendamento ASC';
      
      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos futuros:', error);
      throw error;
    }
  },

  // Estatísticas de agendamentos
  getEstatisticas: async (prestador_id = null) => {
    try {
      let whereClause = '';
      let params = [];
      
      if (prestador_id) {
        whereClause = 'WHERE prestador_id = $1';
        params.push(prestador_id);
      }
      
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'agendado' THEN 1 END) as agendados,
          COUNT(CASE WHEN status = 'confirmado' THEN 1 END) as confirmados,
          COUNT(CASE WHEN status = 'em_andamento' THEN 1 END) as em_andamento,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          COUNT(CASE WHEN status = 'ausente' THEN 1 END) as ausentes,
          COUNT(CASE WHEN data_agendamento > NOW() THEN 1 END) as futuros
        FROM agendamentos 
        ${whereClause}
      `;
      
      const result = await db.query(query, params);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

module.exports = Agendamento;