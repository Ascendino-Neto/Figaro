const db = require('./src/config/db');

async function verificarChavesEstrangeiras(cliente_id, prestador_id, servico_id) {
  try {
    console.log('🔍 Verificando chaves estrangeiras...\n');

    // Verificar cliente
    const cliente = await db.query('SELECT id, nome FROM clientes WHERE id = $1', [cliente_id]);
    console.log('👥 CLIENTE:');
    if (cliente.rows.length > 0) {
      console.log(`   ✅ ID ${cliente_id}: ${cliente.rows[0].nome}`);
    } else {
      console.log(`   ❌ ID ${cliente_id}: NÃO ENCONTRADO`);
    }

    // Verificar prestador
    const prestador = await db.query('SELECT id, nome FROM prestadores WHERE id = $1', [prestador_id]);
    console.log('💼 PRESTADOR:');
    if (prestador.rows.length > 0) {
      console.log(`   ✅ ID ${prestador_id}: ${prestador.rows[0].nome}`);
    } else {
      console.log(`   ❌ ID ${prestador_id}: NÃO ENCONTRADO`);
    }

    // Verificar serviço
    const servico = await db.query('SELECT id, nome FROM servicos WHERE id = $1 AND ativo = true', [servico_id]);
    console.log('✂️ SERVIÇO:');
    if (servico.rows.length > 0) {
      console.log(`   ✅ ID ${servico_id}: ${servico.rows[0].nome}`);
    } else {
      console.log(`   ❌ ID ${servico_id}: NÃO ENCONTRADO ou inativo`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar chaves:', error);
  }
}

// Teste com os IDs que você está usando
verificarChavesEstrangeiras(1, 1, 1); // Substitua pelos IDs reais