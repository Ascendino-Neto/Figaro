const db = require('./src/config/db');

async function listarClientes() {
  try {
    console.log('👥 Listando todos os clientes...\n');

    const result = await db.query('SELECT id, nome, email, telefone FROM clientes ORDER BY id');
    
    console.log('📋 CLIENTES DISPONÍVEIS:');
    result.rows.forEach(cliente => {
      console.log(`   ID: ${cliente.id} - ${cliente.nome} (${cliente.email})`);
    });

    console.log(`\n🎯 Total: ${result.rows.length} clientes`);

  } catch (error) {
    console.error('❌ Erro ao listar clientes:', error);
  }
}

listarClientes();