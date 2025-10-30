const User = require('./src/models/userModel');

async function test() {
  try {
    console.log('🧪 Testando UserModel com PostgreSQL...');
    
    // Teste criação de usuário admin
    const usuarioAdmin = await User.create({
      email: "admin2@figaro.com",
      senha: "admin123",
      tipo: "admin"
    });
    
    console.log('✅ Usuário admin criado:', usuarioAdmin.email);
    
    // Teste criação de usuário cliente
    const usuarioCliente = await User.create({
      email: "cliente2@teste.com",
      senha: "123456",
      tipo: "cliente",
      cliente_id: 1
    });
    
    console.log('✅ Usuário cliente criado:', usuarioCliente.email);
    
    // Teste busca por email
    const encontrado = await User.findByEmail("admin2@figaro.com");
    console.log('✅ Usuário encontrado:', encontrado.email, '- Tipo:', encontrado.tipo);
    
    // Teste busca todos
    const todos = await User.findAll();
    console.log('✅ Total de usuários:', todos.length);
    
    // Teste busca por tipo
    const admins = await User.findByTipo('admin');
    console.log('✅ Usuários admin:', admins.length);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();