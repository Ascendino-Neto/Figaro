const db = require('../config/db');

// Função para validar CPF (mantida igual)
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
  // Criar cliente (ATUALIZADO para PostgreSQL)
  create: async (data) => {
    const { nome, cpf, telefone, email } = data;

    // ✅ VALIDAÇÃO FLEXÍVEL DE CPF (mantida)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      throw new Error("CPF inválido. Deve conter 11 dígitos");
    }

    // ✅ VALIDAÇÃO FLEXÍVEL DE TELEFONE (mantida)
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos (com DDD)");
    }

    // Formata para o padrão do banco
    const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    const telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

    try {
      // ✅ MUDANÇA: Usando $1, $2... e RETURNING *
      const query = `
        INSERT INTO clientes (nome, cpf, telefone, email)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      // ✅ MUDANÇA: await + db.query (não db.run)
      const result = await db.query(query, [nome, cpfFormatado, telefoneFormatado, email]);
      
      // ✅ MUDANÇA: Retorna result.rows[0] (não this.lastID)
      return result.rows[0];
      
    } catch (error) {
      // ✅ MUDANÇA: Código de erro específico do PostgreSQL
      if (error.code === '23505') { // Violação de unique constraint
        throw new Error("CPF ou e-mail já cadastrado.");
      }
      throw new Error("Erro ao salvar no banco de dados: " + error.message);
    }
  },

  // Buscar cliente por CPF (ATUALIZADO)
  findByCpf: async (cpf) => {
    try {
      // ✅ MUDANÇA: $1 em vez de ?
      const query = "SELECT * FROM clientes WHERE cpf = $1";
      const result = await db.query(query, [cpf]);
      return result.rows[0]; // ✅ Retorna a primeira linha ou null
    } catch (error) {
      console.error('Erro ao buscar cliente por CPF:', error);
      throw error;
    }
  },

  // Buscar cliente por ID (ATUALIZADO)
  findById: async (id) => {
    try {
      // ✅ MUDANÇA: $1 em vez de ?
      const query = "SELECT * FROM clientes WHERE id = $1";
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar cliente por ID:', error);
      throw error;
    }
  },

  // Buscar cliente por email (ATUALIZADO)
  findByEmail: async (email) => {
    try {
      // ✅ MUDANÇA: $1 em vez de ?
      const query = "SELECT * FROM clientes WHERE email = $1";
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar cliente por email:', error);
      throw error;
    }
  },

  findAll: async () => {
  try {
    const query = "SELECT * FROM clientes ORDER BY nome";
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('❌ Erro ao buscar todos os clientes:', error);
    throw error;
  }
},

  // Deletar cliente por email (ATUALIZADO)
  deleteByEmail: async (email) => {
    try {
      // ✅ MUDANÇA: $1 em vez de ?
      const query = "DELETE FROM clientes WHERE email = $1";
      const result = await db.query(query, [email]);
      
      // ✅ MUDANÇA: result.rowCount em vez de this.changes
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }
};

module.exports = Cliente;