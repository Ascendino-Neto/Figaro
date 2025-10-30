const db = require('../config/db');

const Prestador = {
  create: async (prestadorData) => {
    const { nome, cpf, endereco, telefone, cep, email } = prestadorData;

    // ? VALIDAÇÃO DE CPF MAIS FLEXÍVEL (mantida)
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove não-números
    if (cpfLimpo.length !== 11) {
      throw new Error("CPF inválido. Deve conter 11 dígitos");
    }

    // ? VALIDAÇÃO DE CEP MAIS FLEXÍVEL (mantida)
    const cepLimpo = cep.replace(/\D/g, ''); // Remove não-números
    if (cepLimpo.length !== 8) {
      throw new Error("CEP inválido. Deve conter 8 dígitos");
    }

    // ? VALIDAÇÃO DE TELEFONE MAIS FLEXÍVEL (mantida)
    const telefoneLimpo = telefone.replace(/\D/g, ''); // Remove não-números
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos (com DDD)");
    }

    try {
      // ? Formata os dados para o padrão do banco
      const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      const cepFormatado = cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
      const telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

      // ? MUDANÇA: Usando $1, $2... e RETURNING *
      const query = `
        INSERT INTO prestadores (nome, cpf, endereco, telefone, cep, email)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      console.log('?? Salvando prestador no PostgreSQL:', {
        nome,
        cpf: cpfFormatado,
        telefone: telefoneFormatado,
        cep: cepFormatado,
        email
      });
      
      // ? MUDANÇA: await + db.query (não db.run)
      const result = await db.query(query, [
        nome, 
        cpfFormatado, 
        endereco, 
        telefoneFormatado, 
        cepFormatado, 
        email
      ]);
      
      console.log('? Prestador salvo com ID:', result.rows[0].id);
      
      // ? MUDANÇA: Retorna result.rows[0] (não this.lastID)
      return result.rows[0];
      
    } catch (error) {
      console.error('? Erro no PostgreSQL:', error.message);
      
      // ? MUDANÇA: Código de erro específico do PostgreSQL
      if (error.code === '23505') { // Violação de unique constraint
        throw new Error("CPF ou e-mail já cadastrado");
      }
      throw new Error("Erro ao salvar no banco de dados: " + error.message);
    }
  },

  findAll: async () => {
    try {
      // ? MUDANÇA: db.query + async/await
      const result = await db.query("SELECT * FROM prestadores ORDER BY nome");
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar prestadores:', error);
      throw error;
    }
  },

  deleteByEmail: async (email) => {
    try {
      // ? MUDANÇA: $1 em vez de ?
      const query = "DELETE FROM prestadores WHERE email = $1";
      const result = await db.query(query, [email]);
      
      // ? MUDANÇA: result.rowCount em vez de this.changes
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('? Erro ao deletar prestador:', error);
      throw error;
    }
  },

  // ? MÉTODOS ADICIONAIS (úteis para o sistema)
  findById: async (id) => {
    try {
      const query = "SELECT * FROM prestadores WHERE id = $1";
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar prestador por ID:', error);
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const query = "SELECT * FROM prestadores WHERE email = $1";
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar prestador por email:', error);
      throw error;
    }
  },

  findByCpf: async (cpf) => {
    try {
      const query = "SELECT * FROM prestadores WHERE cpf = $1";
      const result = await db.query(query, [cpf]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar prestador por CPF:', error);
      throw error;
    }
  },

  // ? ATUALIZAR prestador
  update: async (id, prestadorData) => {
    const { nome, endereco, telefone, cep, email } = prestadorData;
    
    try {
      const query = `
        UPDATE prestadores 
        SET nome = $1, endereco = $2, telefone = $3, cep = $4, email = $5, atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      
      const result = await db.query(query, [nome, endereco, telefone, cep, email, id]);
      
      if (result.rows.length === 0) {
        throw new Error("Prestador não encontrado");
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao atualizar prestador:', error);
      throw error;
    }
  },

  // ? BUSCAR prestadores ativos
  findAtivos: async () => {
    try {
      const query = "SELECT * FROM prestadores WHERE ativo = true ORDER BY nome";
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar prestadores ativos:', error);
      throw error;
    }
  }
};

module.exports = Prestador;