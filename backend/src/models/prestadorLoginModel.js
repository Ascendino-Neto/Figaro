const db = require('../config/db');

const PrestadorLogin = {
  create: async (data) => {
    const { email, senha, telefone, prestador_id } = data;

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
        INSERT INTO usuarios (email, senha, telefone, tipo, prestador_id)
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
        'prestador',
        prestador_id
      ]);
      
      const usuarioCriado = result.rows[0];
      
      console.log('? Login de prestador criado com ID:', usuarioCriado.id);
      
      return { 
        id: usuarioCriado.id, 
        email: usuarioCriado.email, 
        telefone: usuarioCriado.telefone,
        tipo: usuarioCriado.tipo,
        prestador_id: usuarioCriado.prestador_id 
      };
      
    } catch (error) {
      console.error('? Erro ao criar login do prestador:', error.message);
      
      // ? MUDANÇA: Códigos de erro específicos do PostgreSQL
      if (error.code === '23505') { // Violação de unique constraint
        throw new Error("E-mail já cadastrado.");
      }
      if (error.code === '23503') { // Violação de foreign key
        throw new Error("Prestador não encontrado.");
      }
      if (error.code === '23514') { // Violação de check constraint
        throw new Error("Dados inconsistentes para usuário do tipo prestador.");
      }
      
      throw new Error("Erro ao criar login: " + error.message);
    }
  },

  findByEmail: async (email) => {
    try {
      // ? MUDANÇA: $1 placeholder e JOIN com prestador
      const query = `
        SELECT u.*, p.nome as prestador_nome, p.telefone as prestador_telefone, p.email as prestador_email
        FROM usuarios u
        LEFT JOIN prestadores p ON u.prestador_id = p.id
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

  // Buscar por prestador_id
  findByPrestadorId: async (prestador_id) => {
    try {
      const query = `
        SELECT u.*, p.nome as prestador_nome, p.telefone as prestador_telefone
        FROM usuarios u
        LEFT JOIN prestadores p ON u.prestador_id = p.id
        WHERE u.prestador_id = $1 AND u.tipo = 'prestador'
      `;
      
      const result = await db.query(query, [prestador_id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar login por prestador_id:', error);
      throw error;
    }
  },

  // Atualizar senha
  updateSenha: async (prestador_id, novaSenha) => {
    try {
      if (!novaSenha || novaSenha.length < 6) {
        throw new Error("Senha deve ter pelo menos 6 caracteres.");
      }

      const query = `
        UPDATE usuarios 
        SET senha = $1, atualizado_em = CURRENT_TIMESTAMP
        WHERE prestador_id = $2 AND tipo = 'prestador'
        RETURNING id, email
      `;
      
      const result = await db.query(query, [novaSenha, prestador_id]);
      
      if (result.rows.length === 0) {
        throw new Error("Usuário não encontrado");
      }
      
      console.log('? Senha atualizada para prestador:', result.rows[0].email);
      return { success: true, message: "Senha atualizada com sucesso" };
      
    } catch (error) {
      console.error('? Erro ao atualizar senha:', error);
      throw error;
    }
  },

  // Verificar se email existe (excluindo um prestador específico)
  emailExists: async (email, excludePrestadorId = null) => {
    try {
      let query = `
        SELECT COUNT(*) as count 
        FROM usuarios 
        WHERE email = $1 AND tipo = 'prestador'
      `;
      let params = [email];

      if (excludePrestadorId) {
        query += ' AND prestador_id != $2';
        params.push(excludePrestadorId);
      }
      
      const result = await db.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('? Erro ao verificar email:', error);
      throw error;
    }
  },

  // Deletar login do prestador
  delete: async (prestador_id) => {
    try {
      const query = `
        DELETE FROM usuarios 
        WHERE prestador_id = $1 AND tipo = 'prestador'
      `;
      
      const result = await db.query(query, [prestador_id]);
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('? Erro ao deletar login do prestador:', error);
      throw error;
    }
  },

  // Buscar todos os logins de prestadores (para admin)
  findAllPrestadores: async () => {
    try {
      const query = `
        SELECT u.*, p.nome as prestador_nome, p.telefone as prestador_telefone, p.email as prestador_email
        FROM usuarios u
        LEFT JOIN prestadores p ON u.prestador_id = p.id
        WHERE u.tipo = 'prestador'
        ORDER BY p.nome
      `;
      
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar logins de prestadores:', error);
      throw error;
    }
  },

  // Atualizar informações do login
  update: async (prestador_id, updateData) => {
    const { email, telefone } = updateData;
    
    try {
      const updates = [];
      const values = [];
      let paramCount = 0;

      if (email !== undefined) {
        paramCount++;
        updates.push(`email = $${paramCount}`);
        values.push(email);
      }

      if (telefone !== undefined) {
        paramCount++;
        updates.push(`telefone = $${paramCount}`);
        values.push(telefone);
      }

      if (updates.length === 0) {
        throw new Error("Nenhum campo para atualizar");
      }

      paramCount++;
      updates.push(`atualizado_em = CURRENT_TIMESTAMP`);
      values.push(prestador_id);

      const query = `
        UPDATE usuarios 
        SET ${updates.join(', ')}
        WHERE prestador_id = $${paramCount} AND tipo = 'prestador'
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error("Login de prestador não encontrado");
      }
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error("Email já está em uso");
      }
      console.error('? Erro ao atualizar login do prestador:', error);
      throw error;
    }
  }
};

module.exports = PrestadorLogin;