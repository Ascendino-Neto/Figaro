const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco SQLite
const dbPath = path.join(__dirname, '../../figaro.db');
const db = new sqlite3.Database(dbPath);

// Função para criar tabelas
function createTables() {
  db.serialize(() => {
    // Tabela de clientes (US 1) - Dados pessoais
    db.run(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        telefone TEXT,
        email TEXT UNIQUE,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de usuários (US 2) - Dados de login (SEM a coluna 'nome')
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        telefone TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      )
    `);

    // Tabela de agendamentos (para futuras implementações)
    db.run(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        data_agendamento DATETIME NOT NULL,
        servico TEXT NOT NULL,
        barbeiro TEXT NOT NULL,
        status TEXT DEFAULT 'agendado',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes (id)
      )
    `);

    console.log('? Tabelas criadas com sucesso!');
  });
}

// Função para verificar e atualizar a estrutura da tabela usuarios
function updateTableStructure() {
  db.get("PRAGMA table_info(usuarios)", (err, columns) => {
    if (err) {
      console.error('? Erro ao verificar estrutura da tabela:', err.message);
      return;
    }
    
    if (columns && columns.length > 0) {
      // Verifica se a coluna 'nome' existe
      const nomeColumn = columns.find(col => col.name === 'nome');
      if (nomeColumn) {
        console.log('?? Atualizando estrutura da tabela usuarios...');
        
        db.serialize(() => {
          // 1. Criar tabela temporária sem a coluna 'nome'
          db.run(`
            CREATE TABLE usuarios_temp (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              cliente_id INTEGER,
              email TEXT UNIQUE NOT NULL,
              senha TEXT NOT NULL,
              telefone TEXT,
              criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (cliente_id) REFERENCES clientes (id)
            )
          `);
          
          // 2. Copiar dados existentes (se houver)
          db.run(`
            INSERT INTO usuarios_temp (id, cliente_id, email, senha, telefone, criado_em)
            SELECT id, cliente_id, email, senha, telefone, criado_em FROM usuarios
          `);
          
          // 3. Remover tabela antiga
          db.run(`DROP TABLE usuarios`);
          
          // 4. Renomear tabela temporária
          db.run(`ALTER TABLE usuarios_temp RENAME TO usuarios`);
          
          console.log('? Estrutura da tabela usuarios atualizada!');
        });
      }
    }
  });
}

// Teste de conexão e criação/atualização de tabelas
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'", (err, row) => {
  if (err) {
    console.error('? Erro ao conectar com SQLite:', err.message);
  } else {
    console.log('? Conectado ao SQLite com sucesso!');
    
    if (!row) {
      // Se a tabela usuarios não existe, criar todas as tabelas
      createTables();
    } else {
      // Se a tabela existe, verificar se precisa atualizar a estrutura
      updateTableStructure();
    }
  }
});

// Verificar se todas as tabelas necessárias existem
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('? Erro ao verificar tabelas:', err.message);
    return;
  }
  
  const tableNames = tables.map(t => t.name);
  const requiredTables = ['clientes', 'usuarios', 'agendamentos'];
  
  const missingTables = requiredTables.filter(table => !tableNames.includes(table));
  
  if (missingTables.length > 0) {
    console.log(`?? Criando tabelas faltantes: ${missingTables.join(', ')}`);
    createTables();
  }
});

module.exports = db;