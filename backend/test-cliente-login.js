const ClienteLogin = require('./src/models/clienteLoginModel');

async function test() {
  try {
    console.log('🧪 Testando ClienteLoginModel com PostgreSQL...');
    
    // Primeiro precisamos de um cliente existente
    // (assumindo que o cliente com ID 1 existe do teste anterior)
    
    // Teste criação de login
    const login = await ClienteLogin.create({
      email: "cliente.login@teste.com",
      senha: "senha123",
      telefone: "(11) 97777-8888",
      cliente_id: 1
    });
    
    console.log('✅ Login de cliente criado:', login.email);
    
    // Teste busca por email
    const encontrado = await ClienteLogin.findByEmail("cliente.login@teste.com");
    console.log('✅ Login encontrado:', encontrado.email, '- Tipo:', encontrado.tipo);
    
    // Teste busca por cliente_id
    const porClienteId = await ClienteLogin.findByClienteId(1);
    console.log('✅ Login por cliente_id:', porClienteId?.email);
    
    // Teste verificar email
    const emailExiste = await ClienteLogin.emailExists("cliente.login@teste.com");
    console.log('✅ Email existe:', emailExiste);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();