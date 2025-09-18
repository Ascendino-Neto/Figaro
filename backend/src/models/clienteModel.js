const db = require('../config/db');

// Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let soma = 0;
  let resto;
  
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
  }
  
  resto = (soma * 10) % 11;
  
  if ((resto === 10) || (resto === 11)) {
    resto = 0;
  }
  
  if (resto !== parseInt(cpf.substring(9, 10))) {
    return false;
  }
  
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
  }
  
  resto = (soma * 10) % 11;
  
  if ((resto === 10) || (resto === 11)) {
    resto = 0;
  }
  
  if (resto !== parseInt(cpf.substring(10, 11))) {
    return false;
  }
  
  return true;
}

const Cliente = {
  // Criar cliente (US 1)
  create: (data) => {
    const { nome, cpf, telefone, email, senha } = data;

    // Validação de CPF
    if (!validarCPF(cpf)) {
      throw new Error("CPF inválido.");
    }

    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO clientes (nome, cpf, telefone, email)
        VALUES (?, ?, ?, ?)
      `;
      db.run(query, [nome, cpf, telefone, email], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error("CPF ou e-mail já cadastrado."));
          }
          return reject(err);
        }
        resolve({ id: this.lastID, nome, cpf, telefone, email });
      });
    });
  },

  // Buscar cliente por CPF
  findByCpf: (cpf) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM clientes WHERE cpf = ?", [cpf], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Buscar cliente por ID
  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM clientes WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  deleteByEmail: (email) => {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM clientes WHERE email = ?", [email], function (err) {
      if (err) reject(err);
      else resolve({ deleted: this.changes });
    });
  });
},
  
  // Buscar cliente por email
  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM clientes WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};


module.exports = Cliente;