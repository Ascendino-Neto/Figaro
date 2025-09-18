const db = require('../config/db');

const Prestador = {
  create: (prestadorData) => {
    const { nome, cpf, endereco, telefone, cep, email } = prestadorData;

    // ✅ VALIDAÇÃO DE CPF MAIS FLEXÍVEL
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não-números
    if (cpfLimpo.length !== 11) {
      throw new Error("CPF inválido. Deve conter 11 dígitos");
    }

    // ✅ VALIDAÇÃO DE CEP MAIS FLEXÍVEL
    const cepLimpo = cep.replace(/\D/g, ''); // Remove não-números
    if (cepLimpo.length !== 8) {
      throw new Error("CEP inválido. Deve conter 8 dígitos");
    }

    // ✅ VALIDAÇÃO DE TELEFONE MAIS FLEXÍVEL
    const telefoneLimpo = telefone.replace(/\D/g, ''); // Remove não-números
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos (com DDD)");
    }

    return new Promise((resolve, reject) => {
      // ✅ Formata os dados para o padrão do banco
      const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      const cepFormatado = cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
      const telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

      const query = `
        INSERT INTO prestadores (nome, cpf, endereco, telefone, cep, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      console.log('💾 Salvando prestador:', {
        nome,
        cpf: cpfFormatado,
        telefone: telefoneFormatado,
        cep: cepFormatado,
        email
      });
      
      db.run(query, [
        nome, 
        cpfFormatado, 
        endereco, 
        telefoneFormatado, 
        cepFormatado, 
        email
      ], function (err) {
        if (err) {
          console.error('❌ Erro no SQL:', err.message);
          if (err.message.includes('UNIQUE constraint failed')) {
            return reject(new Error("CPF ou e-mail já cadastrado"));
          }
          return reject(new Error("Erro ao salvar no banco de dados"));
        }
        console.log('✅ Prestador salvo com ID:', this.lastID);
        resolve({ 
          id: this.lastID, 
          nome, 
          cpf: cpfFormatado, 
          endereco, 
          telefone: telefoneFormatado, 
          cep: cepFormatado, 
          email 
        });
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
  },

  deleteByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM prestadores WHERE email = ?", [email], function (err) {
        if (err) reject(err);
        else resolve({ deleted: this.changes });
      });
    });
  }
};

module.exports = Prestador;