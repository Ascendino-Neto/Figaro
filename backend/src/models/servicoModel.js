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
        resolve({ 
          id: this.lastID, 
          ...servicoData,
          criado_em: new Date().toISOString()
        });
      });
    });
  },

  findByPrestadorId: (prestador_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM servicos 
        WHERE prestador_id = ? 
        ORDER BY criado_em DESC
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
  }
};

module.exports = Servico;