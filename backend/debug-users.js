const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'figaro.db');
const db = new sqlite3.Database(dbPath);

console.log('?? Verificando usu�rios no banco de dados...');

// Lista todos os usu�rios
db.all("SELECT * FROM usuarios", (err, rows) => {
  if (err) {
    console.error('? Erro ao buscar usu�rios:', err);
    return;
  }
  
  console.log(`?? Total de usu�rios: ${rows.length}`);
  rows.forEach((user, index) => {
    console.log(`\n?? Usu�rio ${index + 1}:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Senha: ${user.senha}`);
    console.log(`   Telefone: ${user.telefone}`);
    console.log(`   Criado em: ${user.criado_em}`);
  });
  
  db.close();
});