const Cliente = require('./src/models/clienteModel');
const ClienteLogin = require('./src/models/clienteLoginModel');

async function criarClienteTeste() {
  try {
    console.log('👤 Criando cliente de teste...');

    const clienteData = {
      nome: "Cliente Teste Agendamento",
      cpf: "123.456.789-09",
      telefone: "(11) 99999-8888",
      email: "cliente.agendamento@teste.com"
    };

    // Criar cliente
    const cliente = await Cliente.create(clienteData);
    console.log('✅ Cliente criado:', cliente);

    // Criar login do cliente
    const loginData = {
      email: clienteData.email,
      senha: "123456",
      telefone: clienteData.telefone,
      cliente_id: cliente.id
    };

    const login = await ClienteLogin.create(loginData);
    console.log('✅ Login do cliente criado:', login);

    console.log('\n🎉 Cliente de teste criado com sucesso!');
    console.log(`📋 ID do cliente: ${cliente.id}`);
    console.log(`📧 Email: ${clienteData.email}`);
    console.log(`🔐 Senha: 123456`);

    return cliente.id;

  } catch (error) {
    console.error('❌ Erro ao criar cliente de teste:', error.message);
  }
}

criarClienteTeste();