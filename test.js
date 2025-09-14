const pool = require('./src/config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Conexão bem-sucedida:", res.rows[0]);
  } catch (err) {
    console.error("Erro na conexão:", err);
  } finally {
    await pool.end(); // fecha a conexão
  }
})();