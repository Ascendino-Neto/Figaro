#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'figaro.db');

console.log('🔧 CORRIGINDO ESTRUTURA DO BANCO DE DADOS');
console.log('=========================================\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco SQLite.');
});

// Adicionar coluna tempo_duracao na tabela agendamentos
db.run(`ALTER TABLE agendamentos ADD COLUMN tempo_duracao INTEGER`, function(err) {
  if (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✅ Coluna tempo_duracao já existe na tabela agendamentos');
    } else {
      console.error('❌ Erro ao adicionar coluna tempo_duracao:', err.message);
    }
  } else {
    console.log('✅ Coluna tempo_duracao adicionada à tabela agendamentos');
  }

  // Verificar estrutura atualizada
  db.all("PRAGMA table_info(agendamentos)", (err, columns) => {
    if (err) {
      console.error('❌ Erro ao verificar estrutura:', err.message);
    } else {
      console.log('\n📋 ESTRUTURA ATUALIZADA DA TABELA AGENDAMENTOS:');
      columns.forEach(col => {
        console.log(`   ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }

    // Fechar conexão
    db.close((err) => {
      if (err) {
        console.error('❌ Erro ao fechar banco:', err.message);
      } else {
        console.log('\n🔒 Conexão fechada.');
        console.log('✨ Correção aplicada com sucesso!');
        console.log('🔄 Reinicie o servidor backend.');
      }
    });
  });
});