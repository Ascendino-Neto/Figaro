const db = require('../config/db');

const ClienteLogin = {
  create: (data) => {
    const { email, senha, telefone } = data;

    // Valida��o de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inv�lido.");
    }

    // Valida��o de telefone com DDD (m�nimo 10 d�gitos)
    if (!/^\d{10,11}$/.test(telefone)) {
      throw new Error("Telefone inv�lido. Deve conter DDD + n�mero.");
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO usuarios (email, senha, telefone)
        VALUES (?, ?, ?)
      `;
      db.run(query, [email, senha, telefone], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error("E-mail j� cadastrado."));
          }
          return reject(err);
        }
        resolve({ id: this.lastID, email, telefone });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = ClienteLogin;