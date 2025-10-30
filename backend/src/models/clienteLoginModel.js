const db = require('../config/db');

const ClienteLogin = {
  create: async (data) => {
    const { email, senha, telefone, cliente_id } = data;

    // Validação de e-mail (mantida)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("E-mail inválido.");
    }

    // Validação de senha (mantida)
    if (!senha || senha.length < 6) {
      throw new Error("Senha deve ter pelo menos 6 caracteres.");
    }

    // Validação FLEXÍVEL de telefone (mantida)
    if (telefone) {
      const telefoneLimpo = telefone.replace(/\D/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        throw new Error("Telefone inválido. Deve conter 10 ou 11 dígitos com DDD.");
      }
    }

    try {
      const query = `
        INSERT INTO usuarios (email, senha, telefone, tipo, cliente_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      // Formata o telefone para padrão consistente
      let telefoneFormatado = telefone;
      if (telefone) {
        const telefoneLimpo = telefone.replace(/\D/g, '');
        telefoneFormatado = telefoneLimpo.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      }
      
      // ? MUDANÇA: await + db.query com RETURNING
      const result = await db.query(query, [
        email, 
        senha, 
        telefoneFormatado, 
        'cliente',
        cliente_id
      ]);
      
      const usuarioCriado = result.rows[0];
      
      console.log('? Login de cliente criado com ID:', usuarioCriado.id);
      
      return { 
        id: usuarioCriado.id, 
        email: usuarioCriado.email, 
        telefone: usuarioCriado.telefone,
        tipo: usuarioCriado.tipo,
        cliente_id: usuarioCriado.cliente_id 
      };
      
    } catch (error) {
      console.error('? Erro ao criar login do cliente:', error.message);
      
      // ? MUDANÇA: Códigos de erro específicos do PostgreSQL
      if (error.code === '23505') { // Violação de unique constraint
        throw new Error("E-mail já cadastrado.");
      }
      if (error.code === '23503') { // Violação de foreign key
        throw new Error("Cliente não encontrado.");
      }
      if (error.code === '23514') { // Violação de check constraint
        throw new Error("Dados inconsistentes para usuário do tipo cliente.");
      }
      
      throw new Error("Erro ao criar login: " + error.message);
    }
  },

  findByEmail: async (email) => {
    try {
      // ? MUDANÇA: $1 placeholder e JOIN com cliente
      const query = `
        SELECT u.*, c.nome as cliente_nome, c.telefone as cliente_telefone
        FROM usuarios u
        LEFT JOIN clientes c ON u.cliente_id = c.id
        WHERE u.email = $1
      `;
      
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar usuário por email:', error);
      throw error;
    }
  },

  // ? MÉTODOS ADICIONAIS (úteis para o sistema)

  // Buscar por cliente_id
  findByClienteId: async (cliente_id) => {
    try {
      const query = `
        SELECT u.*, c.nome as cliente_nome
        FROM usuarios u
        LEFT JOIN clientes c ON u.cliente_id = c.id
        WHERE u.cliente_id = $1 AND u.tipo = 'cliente'
      `;
      
      const result = await db.query(query, [cliente_id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar login por cliente_id:', error);
      throw error;
    }
  },

  // Atualizar senha
  updateSenha: async (cliente_id, novaSenha) => {
    try {
      if (!novaSenha || novaSenha.length < 6) {
        throw new Error("Senha deve ter pelo menos 6 caracteres.");
      }

      const query = `
        UPDATE usuarios 
        SET senha = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE cliente_id = $2 AND tipo = 'cliente'
        RETURNING id, email
      `;
      
      const result = await db.query(query, [novaSenha, cliente_id]);
      
      if (result.rows.length === 0) {
        throw new Error("Usuário não encontrado");
      }
      
      console.log('? Senha atualizada para cliente:', result.rows[0].email);
      return { success: true, message: "Senha atualizada com sucesso" };
      
    } catch (error) {
      console.error('? Erro ao atualizar senha:', error);
      throw error;
    }
  },

  // Verificar se email existe (excluindo um cliente específico)
  emailExists: async (email, excludeClienteId = null) => {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM usuarios 
        WHERE email = $1 AND tipo = 'cliente'
      `;
      let params = [email];

      if (excludeClienteId) {
        query += ' AND cliente_id != $2';
        params.push(excludeClienteId);
      }
      
      const result = await db.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('? Erro ao verificar email:', error);
      throw error;
    }
  },

  // Deletar login do cliente
  delete: async (cliente_id) => {
    try {
      const query = `
        DELETE FROM usuarios 
        WHERE cliente_id = $1 AND tipo = 'cliente'
      `;
      
      const result = await db.query(query, [cliente_id]);
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('? Erro ao deletar login do cliente:', error);
      throw error;
    }
  }
};

module.exports = ClienteLogin;