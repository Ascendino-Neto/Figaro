const db = require('../config/db');

const PrestadorLogin = {
  create: (data) => {
    const { email, senha, telefone, prestador_id } = data; // ? RECEBE prestador_id

    // Validação de e-mail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido.");
    }

    // Validação de senha
    if (!senha || senha.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres.");
    }

    // Validação FLEXÍVEL de telefone
    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos com DDD.");
      }
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO usuarios (email, senha, telefone, tipo, prestador_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // Formata o telefone para padrão consistente
      let telefoneFormatado = telefone;
      if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      }
      
      db.run(query, [
        email, 
        senha, 
        telefoneFormatado, 
        'prestador', // ? TIPO CORRETO
        prestador_id // ? ID DO PRESTADOR
      ], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error("E-mail já cadastrado."));
          }
          return reject(err);
        }
        resolve({ 
          id: this.lastID, 
          email, 
          telefone: telefoneFormatado,
          tipo: 'prestador',
          prestador_id 
        });
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

module.exports = PrestadorLogin;