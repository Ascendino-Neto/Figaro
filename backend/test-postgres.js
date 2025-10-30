const db = require('./src/config/db');

async function testPostgreSQL() {
  try {
    console.log('🧪 Testando conexão com PostgreSQL...');
    
    // Teste 1: Conexão básica
    const result = await db.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Conexão OK');
    console.log('   📅 Hora do servidor:', result.rows[0].current_time);
    console.log('   🐘 PostgreSQL:', result.rows[0].version.split(',')[0]);
    
    // Teste 2: Listar tabelas
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas encontradas:');
    tables.rows.forEach(table => {
      console.log('   ✅', table.table_name);
    });
    
    // Teste 3: Contar registros
    const counts = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes) as clientes,
        (SELECT COUNT(*) FROM prestadores) as prestadores,
        (SELECT COUNT(*) FROM servicos) as servicos,
        (SELECT COUNT(*) FROM usuarios) as usuarios,
        (SELECT COUNT(*) FROM agendamentos) as agendamentos
    `);
    
    console.log('📈 Registros iniciais:');
    console.log('   👥 Clientes:', counts.rows[0].clientes);
    console.log('   💼 Prestadores:', counts.rows[0].prestadores);
    console.log('   ✂️ Serviços:', counts.rows[0].servicos);
    console.log('   👤 Usuários:', counts.rows[0].usuarios);
    console.log('   📅 Agendamentos:', counts.rows[0].agendamentos);
    
    // Teste 4: Verificar usuários
    const usuarios = await db.query(`
      SELECT tipo, email, cliente_id, prestador_id 
      FROM usuarios 
      ORDER BY tipo
    `);
    
    console.log('🔐 Usuários cadastrados:');
    usuarios.rows.forEach(usuario => {
      console.log(`   ${usuario.tipo}: ${usuario.email}`);
    });
    
    console.log('\n🎉 PostgreSQL configurado com sucesso!');
    console.log('🚀 Você pode iniciar o servidor com: npm start');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('\n🔧 Verifique:');
    console.log('   1. Se o PostgreSQL está rodando');
    console.log('   2. Se a senha no .env está correta');
    console.log('   3. Se o database "figaro_schedule" existe');
  }
}

testPostgreSQL();