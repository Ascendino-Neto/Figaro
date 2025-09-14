const pool = require('../config/db');

const User = {
  // Criar usuário
  async create(userData) {
    const { nome, email, senha } = userData;
    const query = `
      INSERT INTO usuarios (nome, email, senha) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `;
    const values = [nome, email, senha];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Buscar usuário por email
  async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Buscar todos os usuários
  async findAll() {
    try {
      const result = await pool.query('SELECT * FROM usuarios');
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;