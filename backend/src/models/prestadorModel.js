const db = require('../config/db');

const Prestador = {
  create: (prestadorData) => {
    const { nome, cpf, endereco, telefone, cep } = prestadorData;

    // Validação básica de CPF
    if (!/^\d{11}$/.test(cpf)) {
      throw new Error("CPF inválido. Deve conter 11 dígitos numéricos.");
    }

    // Validação simples de CEP (8 dígitos)
    if (!/^\d{8}$/.test(cep)) {
      throw new Error("CEP inválido. Deve conter 8 dígitos.");
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO prestadores (nome, cpf, endereco, telefone, cep)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(query, [nome, cpf, endereco, telefone, cep], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, ...prestadorData });
      });
    });
  },

  findAll: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM prestadores", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Prestador;