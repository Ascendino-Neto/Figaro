const db = require('../config/db');

const Servico = {
  create: (servicoData) => {
    const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id } = servicoData;

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO servicos (nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      console.log('💾 Salvando serviço:', servicoData);
      
      db.run(query, [
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor,
        tempo_duracao,
        prestador_id
      ], function (err) {
        if (err) {
          console.error('❌ Erro no SQL:', err.message);
          return reject(new Error("Erro ao salvar serviço no banco de dados"));
        }
        
        // Busca o serviço criado com informações completas
        const selectQuery = `
          SELECT s.*, p.nome as prestador_nome 
          FROM servicos s
          LEFT JOIN prestadores p ON s.prestador_id = p.id
          WHERE s.id = ?
        `;
        
        db.get(selectQuery, [this.lastID], (err, row) => {
          if (err) {
            console.error('❌ Erro ao buscar serviço criado:', err.message);
            // Ainda assim retorna sucesso com dados básicos
            return resolve({ 
              id: this.lastID, 
              ...servicoData,
              criado_em: new Date().toISOString()
            });
          }
          resolve(row);
        });
      });
    });
  },

  findByPrestadorId: (prestador_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.prestador_id = ? 
        ORDER BY s.criado_em DESC
      `;
      
      db.all(query, [prestador_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        ORDER BY s.criado_em DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // ✅ NOVO: Buscar serviço por ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.id = ?
      `;
      
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // ✅ NOVO: Atualizar serviço
  update: (id, prestador_id, servicoData) => {
    const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao } = servicoData;

    return new Promise((resolve, reject) => {
      const query = `
        UPDATE servicos 
        SET nome = ?, descricao = ?, local_atendimento = ?, 
            tecnicas_utilizadas = ?, valor = ?, tempo_duracao = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ? AND prestador_id = ?
      `;
      
      const params = [
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor,
        tempo_duracao,
        id,
        prestador_id
      ];

      console.log('💾 Atualizando serviço:', { id, prestador_id, ...servicoData });

      db.run(query, params, function (err) {
        if (err) {
          console.error('❌ Erro ao atualizar serviço:', err.message);
          return reject(new Error("Erro ao atualizar serviço no banco de dados"));
        }

        if (this.changes === 0) {
          return reject(new Error("Serviço não encontrado ou você não tem permissão para editá-lo"));
        }

        // Busca o serviço atualizado
        const selectQuery = `
          SELECT s.*, p.nome as prestador_nome 
          FROM servicos s
          LEFT JOIN prestadores p ON s.prestador_id = p.id
          WHERE s.id = ?
        `;
        
        db.get(selectQuery, [id], (err, row) => {
          if (err) {
            console.error('❌ Erro ao buscar serviço atualizado:', err.message);
            return reject(new Error("Serviço atualizado, mas erro ao buscar dados atualizados"));
          }
          resolve(row);
        });
      });
    });
  },

  delete: (id, prestador_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        DELETE FROM servicos 
        WHERE id = ? AND prestador_id = ?
      `;
      
      db.run(query, [id, prestador_id], function (err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  },

  // ✅ NOVO: Buscar apenas serviços ativos
  findAtivos: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.*, p.nome as prestador_nome 
        FROM servicos s
        LEFT JOIN prestadores p ON s.prestador_id = p.id
        WHERE s.ativo = 1
        ORDER BY s.criado_em DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // ✅ NOVO: Ativar/Desativar serviço
  toggleAtivo: (id, prestador_id, ativo) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE servicos 
        SET ativo = ?, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ? AND prestador_id = ?
      `;
      
      db.run(query, [ativo ? 1 : 0, id, prestador_id], function (err) {
        if (err) reject(err);
        else resolve({ 
          updated: this.changes,
          message: `Serviço ${ativo ? 'ativado' : 'desativado'} com sucesso`
        });
      });
    });
  }
};

module.exports = Servico;