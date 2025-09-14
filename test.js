const pool = require('./src/config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log("Conex�o bem-sucedida:", res.rows[0]);
  } catch (err) {
    console.error("Erro na conex�o:", err);
  } finally {
    await pool.end(); // fecha a conex�o
  }
})();