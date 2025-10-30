const db = require('./src/config/db');
const ClienteLogin = require('./src/models/clienteLoginModel');

async function criarClienteId8() {
  try {
    console.log('👤 Criando cliente com ID 8...');

    // ✅ FORÇAR a criação com ID 8 usando INSERT direto
    const clienteQuery = `
      INSERT INTO clientes (id, nome, cpf, telefone, email)
      VALUES (8, 'Cliente Agendamento', '888.888.888-88', '(11) 88888-8888', 'cliente.agendamento@email.com')
      ON CONFLICT (id) DO NOTHING
      RETURNING *
    `;

    const clienteResult = await db.query(clienteQuery);
    
    if (clienteResult.rows.length > 0) {
      console.log('✅ Cliente criado:', clienteResult.rows[0]);
      
      // Criar login para este cliente
      const loginData = {
        email: 'cliente.agendamento@email.com',
        senha: '123456',
        telefone: '(11) 88888-8888',
        cliente_id: 8
      };

      try {
        const login = await ClienteLogin.create(loginData);
        console.log('✅ Login do cliente criado:', login);
      } catch (loginError) {
        console.log('⚠️ Login já existe ou erro ao criar:', loginError.message);
      }
      
    } else {
      console.log('ℹ️ Cliente com ID 8 já existe');
    }

    // Verificar se foi criado
    const verificarQuery = 'SELECT * FROM clientes WHERE id = 8';
    const verificarResult = await db.query(verificarQuery);
    
    console.log('\n🔍 Cliente verificado:');
    console.log('   ID:', verificarResult.rows[0]?.id);
    console.log('   Nome:', verificarResult.rows[0]?.nome);
    console.log('   Email:', verificarResult.rows[0]?.email);

  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.message);
  }
}

criarClienteId8();