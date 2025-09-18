const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'figaro.db');
const db = new sqlite3.Database(dbPath);

console.log('?? Verificando usuários no banco de dados...');

// Lista todos os usuários
db.all("SELECT * FROM usuarios", (err, rows) => {
  if (err) {
    console.error('? Erro ao buscar usuários:', err);
    return;
  }
  
  console.log(`?? Total de usuários: ${rows.length}`);
  rows.forEach((user, index) => {
    console.log(`\n?? Usuário ${index + 1}:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${user.senha}`);
    console.log(`   Telefone: ${user.telefone}`);
    console.log(`   Criado em: ${user.criado_em}`);
  });
  
  db.close();
});