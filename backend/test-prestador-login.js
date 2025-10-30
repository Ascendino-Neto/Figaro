const PrestadorLogin = require('./src/models/prestadorLoginModel');

async function test() {
  try {
    console.log('🧪 Testando PrestadorLoginModel com PostgreSQL...');
    
    // Primeiro precisamos de um prestador existente
    // (assumindo que o prestador com ID 1 existe do teste anterior)
    
    // Teste criação de login
    const login = await PrestadorLogin.create({
      email: "prestador.login@teste.com",
      senha: "senha123",
      telefone: "(11) 96666-5555",
      prestador_id: 1
    });
    
    console.log('✅ Login de prestador criado:', login.email);
    
    // Teste busca por email
    const encontrado = await PrestadorLogin.findByEmail("prestador.login@teste.com");
    console.log('✅ Login encontrado:', encontrado.email, '- Tipo:', encontrado.tipo);
    console.log('✅ Nome do prestador:', encontrado.prestador_nome);
    
    // Teste busca por prestador_id
    const porPrestadorId = await PrestadorLogin.findByPrestadorId(1);
    console.log('✅ Login por prestador_id:', porPrestadorId?.email);
    
    // Teste verificar email
    const emailExiste = await PrestadorLogin.emailExists("prestador.login@teste.com");
    console.log('✅ Email existe:', emailExiste);
    
    // Teste buscar todos os prestadores
    const todosPrestadores = await PrestadorLogin.findAllPrestadores();
    console.log('✅ Total de logins de prestadores:', todosPrestadores.length);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();