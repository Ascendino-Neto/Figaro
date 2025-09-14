const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho do banco SQLite
const dbPath = path.join(__dirname, '../../figaro.db');
const db = new sqlite3.Database(dbPath);

// Função para criar tabelas
function createTables() {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        telefone TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de agendamentos
    db.run(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        data_agendamento DATETIME NOT NULL,
        servico TEXT NOT NULL,
        barbeiro TEXT NOT NULL,
        status TEXT DEFAULT 'agendado',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `);

    console.log('? Tabelas criadas com sucesso!');
  });
}

// Teste de conexão
db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
  if (err) {
    console.error('? Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('? Conectado ao SQLite com sucesso!');
    if (!row) {
      createTables();
    }
  }
});

module.exports = db;