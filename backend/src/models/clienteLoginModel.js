const db = require('../config/db');

const ClienteLogin = {
  create: (data) => {
    const { email, senha, telefone } = data;

    // Validação de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido.");
    }

    // Validação de senha (mínimo 6 caracteres)
    if (!senha || senha.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres.");
    }

    // ✅ VALIDAÇÃO FLEXÍVEL DE TELEFONE
    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos com DDD.");
      }
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO usuarios (email, senha, telefone, tipo)
        VALUES (?, ?, ?, ?)
      `;
      
      // ✅ Formata o telefone para padrão consistente
      let telefoneFormatado = telefone;
      if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      }
      
      db.run(query, [email, senha, telefoneFormatado, 'cliente'], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error("E-mail já cadastrado."));
          }
          return reject(err);
        }
        resolve({ id: this.lastID, email, telefone: telefoneFormatado });
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