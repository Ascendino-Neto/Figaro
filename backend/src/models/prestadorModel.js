const db = require('../config/db');

const Prestador = {
  create: async (prestadorData) => {
    const { nome, cpf, endereco, telefone, cep, email } = prestadorData;

    // ? VALIDA��O DE CPF MAIS FLEX�VEL (mantida)
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove n�o-n�meros
    if (cpfLimpo.length !== 11) {
      throw new Error("CPF inv�lido. Deve conter 11 d�gitos");
    }

    // ? VALIDA��O DE CEP MAIS FLEX�VEL (mantida)
    const cepLimpo = cep.replace(/\D/g, ''); // Remove n�o-n�meros
    if (cepLimpo.length !== 8) {
      throw new Error("CEP inv�lido. Deve conter 8 d�gitos");
    }

    // ? VALIDA��O DE TELEFONE MAIS FLEX�VEL (mantida)
    const telefoneLimpo = telefone.replace(/\D/g, ''); // Remove n�o-n�meros
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      throw new Error("Telefone inv�lido. Deve conter 10 ou 11 d�gitos (com DDD)");
    }

    try {
      // ? Formata os dados para o padr�o do banco
      const cpfFormatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      const cepFormatado = cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
      const telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');

      // ? MUDAN�A: Usando $1, $2... e RETURNING *
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
      
      // ? MUDAN�A: await + db.query (n�o db.run)
      const result = await db.query(query, [
        nome, 
        cpfFormatado, 
        endereco, 
        telefoneFormatado, 
        cepFormatado, 
        email
      ]);
      
      console.log('? Prestador salvo com ID:', result.rows[0].id);
      
      // ? MUDAN�A: Retorna result.rows[0] (n�o this.lastID)
      return result.rows[0];
      
    } catch (error) {
      console.error('? Erro no PostgreSQL:', error.message);
      
      // ? MUDAN�A: C�digo de erro espec�fico do PostgreSQL
      if (error.code === '23505') { // Viola��o de unique constraint
        throw new Error("CPF ou e-mail j� cadastrado");
      }
      throw new Error("Erro ao salvar no banco de dados: " + error.message);
    }
  },

  findAll: async () => {
    try {
      // ? MUDAN�A: db.query + async/await
      const result = await db.query("SELECT * FROM prestadores ORDER BY nome");
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar prestadores:', error);
      throw error;
    }
  },

  deleteByEmail: async (email) => {
    try {
      // ? MUDAN�A: $1 em vez de ?
      const query = "DELETE FROM prestadores WHERE email = $1";
      const result = await db.query(query, [email]);
      
      // ? MUDAN�A: result.rowCount em vez de this.changes
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('? Erro ao deletar prestador:', error);
      throw error;
    }
  },

  // ? M�TODOS ADICIONAIS (�teis para o sistema)
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
        throw new Error("Prestador n�o encontrado");
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