const db = require('../config/db');

const PrestadorLogin = {
  create: (data) => {
    const { email, senha, telefone } = data;

    // Validação de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido.");
    }

    // Validação de telefone
    if (!/^\d{10,11}$/.test(telefone)) {
      throw new Error("Telefone inválido. Deve conter DDD + número.");
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO usuarios (email, senha, telefone, tipo)
        VALUES (?, ?, ?, ?)
      `;
      db.run(query, [email, senha, telefone, 'prestador'], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID, email, telefone });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ? AND tipo = 'prestador'", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = PrestadorLogin;
