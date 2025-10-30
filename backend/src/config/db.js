const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'figaro_schedule',
  password: process.env.DB_PASSWORD || 'sua_senha',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL - Figaro Schedule');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Funções auxiliares para compatibilidade com o código existente
const get = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Erro na query get:', error);
    throw error;
  }
};

const all = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('❌ Erro na query all:', error);
    throw error;
  }
};

const run = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  } catch (error) {
    console.error('❌ Erro na query run:', error);
    throw error;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  get,
  all,
  run,
  getClient: () => pool.connect(),
  pool
};