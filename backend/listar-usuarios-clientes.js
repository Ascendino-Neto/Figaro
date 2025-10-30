const db = require('./src/config/db');

async function listarUsuariosClientes() {
  try {
    console.log('🔍 ANALISANDO USUÁRIOS E CLIENTES...\n');

    // Listar todos os usuários do tipo cliente
    const usuarios = await db.query(`
      SELECT u.id as usuario_id, u.email, u.cliente_id, c.id as cliente_real_id, c.nome 
      FROM usuarios u 
      LEFT JOIN clientes c ON u.cliente_id = c.id 
      WHERE u.tipo = 'cliente'
      ORDER BY u.id
    `);

    console.log('👥 USUÁRIOS CLIENTES:');
    usuarios.rows.forEach(usuario => {
      console.log(`   Usuário ID: ${usuario.usuario_id} | Cliente ID: ${usuario.cliente_id} | Cliente Real ID: ${usuario.cliente_real_id} | ${usuario.email} | ${usuario.nome || 'N/A'}`);
    });

    // Listar todos os clientes
    const clientes = await db.query('SELECT id, nome, email FROM clientes ORDER BY id');
    console.log('\n📋 CLIENTES NO BANCO:');
    clientes.rows.forEach(cliente => {
      console.log(`   Cliente ID: ${cliente.id} | ${cliente.nome} | ${cliente.email}`);
    });

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log(`   Total usuários cliente: ${usuarios.rows.length}`);
    console.log(`   Total clientes: ${clientes.rows.length}`);
    
    // Verificar inconsistências
    const inconsistentes = usuarios.rows.filter(u => u.cliente_real_id === null);
    if (inconsistentes.length > 0) {
      console.log('\n❌ USUÁRIOS COM PROBLEMAS:');
      inconsistentes.forEach(u => {
        console.log(`   Usuário ${u.usuario_id} (${u.email}) refere-se a cliente_id ${u.cliente_id} que NÃO EXISTE`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

listarUsuariosClientes();