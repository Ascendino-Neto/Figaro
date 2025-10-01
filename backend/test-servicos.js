const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'figaro.db');
const db = new sqlite3.Database(dbPath);

console.log('🧪 Testando funcionalidade de serviços...');

// Insere um prestador de exemplo
db.run(`
  INSERT OR IGNORE INTO prestadores (nome, cpf, endereco, telefone, cep, email)
  VALUES ('Carlos Barber', '123.456.789-00', 'Rua Teste, 123', '(11) 99999-9999', '01234-567', 'carlos@barber.com')
`, function(err) {
  if (err) {
    console.error('❌ Erro ao inserir prestador:', err.message);
    return;
  }
  
  console.log('✅ Prestador de exemplo criado');
  
  // Insere serviços de exemplo
  const servicosExemplo = [
    {
      nome: 'Corte de Cabelo',
      descricao: 'Corte moderno e estilizado',
      local_atendimento: 'Barbearia Figaro',
      tecnicas_utilizadas: 'Tesoura, Máquina',
      valor: 35.00,
      tempo_duracao: 30,
      prestador_id: 1
    },
    {
      nome: 'Barba',
      descricao: 'Barba feita com navalha e produtos premium',
      local_atendimento: 'Barbearia Figaro',
      tecnicas_utilizadas: 'Navalha, Toalha Quente',
      valor: 25.00,
      tempo_duracao: 20,
      prestador_id: 1
    }
  ];
  
  servicosExemplo.forEach((servico, index) => {
    db.run(`
      INSERT INTO servicos (nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      servico.nome,
      servico.descricao,
      servico.local_atendimento,
      servico.tecnicas_utilizadas,
      servico.valor,
      servico.tempo_duracao,
      servico.prestador_id
    ], function(err) {
      if (err) {
        console.error(`❌ Erro ao inserir serviço ${index + 1}:`, err.message);
      } else {
        console.log(`✅ Serviço exemplo ${index + 1} criado: ${servico.nome}`);
      }
      
      // Fecha a conexão após o último serviço
      if (index === servicosExemplo.length - 1) {
        db.close();
        console.log('\n🎉 Dados de teste criados!');
        console.log('🚀 Execute: npm run dev e acesse http://localhost:3000/servicos');
      }
    });
  });
});