const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'figaro.db');
const db = new sqlite3.Database(dbPath);

console.log('?? Testando conexão com SQLite...');

db.get("SELECT datetime('now') as time", (err, row) => {
  if (err) {
    console.error('? Erro no SQLite:', err.message);
  } else {
    console.log('? SQLite conectado com sucesso!');
    console.log('? Hora do servidor:', row.time);
  }
  db.close();
});