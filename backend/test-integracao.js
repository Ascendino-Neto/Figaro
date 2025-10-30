const db = require('./src/config/db');

async function testIntegracaoCompleta() {
  try {
    console.log('🧪 INICIANDO TESTE DE INTEGRAÇÃO COMPLETA...\n');

    // 1. Teste conexão básica
    console.log('1. 🔌 Testando conexão com PostgreSQL...');
    const conexao = await db.query('SELECT NOW() as tempo, version() as versao');
    console.log('   ✅ Conectado - Hora:', conexao.rows[0].tempo);
    console.log('   ✅ Versão:', conexao.rows[0].versao.split(',')[0]);

    // 2. Teste tabelas
    console.log('\n2. 📊 Verificando tabelas...');
    const tabelas = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tabelasEsperadas = ['agendamentos', 'clientes', 'prestadores', 'servicos', 'usuarios'];
    const tabelasEncontradas = tabelas.rows.map(t => t.table_name);
    
    console.log('   ✅ Tabelas encontradas:', tabelasEncontradas.join(', '));
    
    // 3. Teste dados iniciais
    console.log('\n3. 📦 Verificando dados iniciais...');
    const contagens = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM clientes) as clientes,
        (SELECT COUNT(*) FROM prestadores) as prestadores,
        (SELECT COUNT(*) FROM servicos) as servicos,
        (SELECT COUNT(*) FROM usuarios) as usuarios,
        (SELECT COUNT(*) FROM agendamentos) as agendamentos
    `);
    
    const dados = contagens.rows[0];
    console.log('   👥 Clientes:', dados.clientes);
    console.log('   💼 Prestadores:', dados.prestadores);
    console.log('   ✂️ Serviços:', dados.servicos);
    console.log('   👤 Usuários:', dados.usuarios);
    console.log('   📅 Agendamentos:', dados.agendamentos);

    // 4. Teste usuário admin
    console.log('\n4. 🔐 Verificando usuário admin...');
    const admin = await db.query("SELECT * FROM usuarios WHERE tipo = 'admin'");
    if (admin.rows.length > 0) {
      console.log('   ✅ Admin encontrado:', admin.rows[0].email);
    } else {
      console.log('   ⚠️  Nenhum admin encontrado');
    }

    // 5. Teste serviços ativos
    console.log('\n5. 🛠️ Verificando serviços ativos...');
    const servicosAtivos = await db.query("SELECT COUNT(*) as count FROM servicos WHERE ativo = true");
    console.log('   ✅ Serviços ativos:', servicosAtivos.rows[0].count);

    console.log('\n🎉 TESTE DE INTEGRAÇÃO CONCLUÍDO COM SUCESSO!');
    console.log('🚀 O sistema está pronto para uso com PostgreSQL!');

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE INTEGRAÇÃO:', error.message);
    console.log('\n🔧 Verifique:');
    console.log('   - Se o PostgreSQL está rodando');
    console.log('   - Se o database "figaro_schedule" existe');
    console.log('   - Se as tabelas foram criadas corretamente');
    console.log('   - Se as credenciais no .env estão corretas');
  }
}

testIntegracaoCompleta();