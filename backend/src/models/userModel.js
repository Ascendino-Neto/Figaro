const db = require('../config/db');

const User = {
  // Criar usu�rio (ATUALIZADO para novo schema)
  async create(userData) {
    const { email, senha, telefone, tipo, cliente_id, prestador_id } = userData;
    
    // Valida��es b�sicas
    if (!email || !senha || !tipo) {
      throw new Error("Email, senha e tipo s�o obrigat�rios");
    }

    // Validar tipo
    const tiposValidos = ['cliente', 'prestador', 'admin'];
    if (!tiposValidos.includes(tipo)) {
      throw new Error("Tipo de usu�rio inv�lido");
    }

    // Validar relacionamentos conforme o tipo
    if (tipo === 'cliente' && !cliente_id) {
      throw new Error("cliente_id � obrigat�rio para usu�rios do tipo cliente");
    }

    if (tipo === 'prestador' && !prestador_id) {
      throw new Error("prestador_id � obrigat�rio para usu�rios do tipo prestador");
    }

    if (tipo === 'admin' && (cliente_id || prestador_id)) {
      throw new Error("Admin n�o deve ter cliente_id ou prestador_id");
    }

    const query = `
      INSERT INTO usuarios (email, senha, telefone, tipo, cliente_id, prestador_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    const values = [email, senha, telefone || null, tipo, cliente_id || null, prestador_id || null];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Tratamento de erros espec�ficos do PostgreSQL
      if (error.code === '23505') { // Viola��o de unique constraint
        throw new Error("Email j� cadastrado");
      }
      if (error.code === '23503') { // Viola��o de foreign key
        throw new Error("Cliente ou prestador n�o encontrado");
      }
      if (error.code === '23514') { // Viola��o de check constraint
        throw new Error("Dados inconsistentes para o tipo de usu�rio");
      }
      throw new Error("Erro ao criar usu�rio: " + error.message);
    }
  },

  // Buscar usu�rio por email (MANTIDO)
  async findByEmail(email) {
    const query = `
      SELECT u.*, c.nome as cliente_nome, p.nome as prestador_nome 
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      LEFT JOIN prestadores p ON u.prestador_id = p.id
      WHERE u.email = $1
    `;
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar usu�rio por email:', error);
      throw error;
    }
  },

  // Buscar todos os usu�rios (ATUALIZADO com joins)
  async findAll() {
    const query = `
      SELECT u.*, c.nome as cliente_nome, p.nome as prestador_nome 
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      LEFT JOIN prestadores p ON u.prestador_id = p.id
      ORDER BY u.criado_em DESC
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar todos os usu�rios:', error);
      throw error;
    }
  },

  // ? NOVO: Buscar usu�rio por ID
  async findById(id) {
    const query = `
      SELECT u.*, c.nome as cliente_nome, p.nome as prestador_nome 
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      LEFT JOIN prestadores p ON u.prestador_id = p.id
      WHERE u.id = $1
    `;
    
    try {
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar usu�rio por ID:', error);
      throw error;
    }
  },

  // ? NOVO: Buscar usu�rios por tipo
  async findByTipo(tipo) {
    const query = `
      SELECT u.*, c.nome as cliente_nome, p.nome as prestador_nome 
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      LEFT JOIN prestadores p ON u.prestador_id = p.id
      WHERE u.tipo = $1
      ORDER BY u.criado_em DESC
    `;
    
    try {
      const result = await db.query(query, [tipo]);
      return result.rows;
    } catch (error) {
      console.error('? Erro ao buscar usu�rios por tipo:', error);
      throw error;
    }
  },

  // ? NOVO: Atualizar usu�rio
  async update(id, userData) {
    const { email, senha, telefone, ativo } = userData;
    
    const updates = [];
    const values = [];
    let paramCount = 0;

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (senha !== undefined) {
      paramCount++;
      updates.push(`senha = $${paramCount}`);
      values.push(senha);
    }

    if (telefone !== undefined) {
      paramCount++;
      updates.push(`telefone = $${paramCount}`);
      values.push(telefone);
    }

    if (ativo !== undefined) {
      paramCount++;
      updates.push(`ativo = $${paramCount}`);
      values.push(ativo);
    }

    if (updates.length === 0) {
      throw new Error("Nenhum campo para atualizar");
    }

    paramCount++;
    updates.push(`atualizado_em = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE usuarios 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error("Usu�rio n�o encontrado");
      }
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error("Email j� est� em uso");
      }
      console.error('? Erro ao atualizar usu�rio:', error);
      throw error;
    }
  },

  // ? NOVO: Deletar usu�rio
  async delete(id) {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    
    try {
      const result = await db.query(query, [id]);
      return { deleted: result.rowCount };
    } catch (error) {
      console.error('? Erro ao deletar usu�rio:', error);
      throw error;
    }
  },

  // ? NOVO: Buscar usu�rio por cliente_id
  async findByClienteId(cliente_id) {
    const query = 'SELECT * FROM usuarios WHERE cliente_id = $1';
    
    try {
      const result = await db.query(query, [cliente_id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar usu�rio por cliente_id:', error);
      throw error;
    }
  },

  // ? NOVO: Buscar usu�rio por prestador_id
  async findByPrestadorId(prestador_id) {
    const query = 'SELECT * FROM usuarios WHERE prestador_id = $1';
    
    try {
      const result = await db.query(query, [prestador_id]);
      return result.rows[0];
    } catch (error) {
      console.error('? Erro ao buscar usu�rio por prestador_id:', error);
      throw error;
    }
  },

  // ? NOVO: Verificar se email existe
  async emailExists(email, excludeUserId = null) {
    let query = 'SELECT COUNT(*) as count FROM usuarios WHERE email = $1';
    let params = [email];

    if (excludeUserId) {
      query += ' AND id != $2';
      params.push(excludeUserId);
    }
    
    try {
      const result = await db.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('? Erro ao verificar email:', error);
      throw error;
    }
  }
};

module.exports = User;