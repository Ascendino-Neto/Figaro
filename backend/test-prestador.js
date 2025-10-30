const Prestador = require('./src/models/prestadorModel');

async function test() {
  try {
    console.log('🧪 Testando PrestadorModel com PostgreSQL...');
    
    // Teste criação
    const prestador = await Prestador.create({
      nome: "Carlos Barber PostgreSQL",
      cpf: "333.444.555-66",
      endereco: "Rua PostgreSQL, 123",
      telefone: "(11) 95555-4444",
      cep: "01234-567",
      email: "carlos.pg@barber.com"
    });
    
    console.log('✅ Prestador criado:', prestador.nome);
    
    // Teste busca todos
    const todos = await Prestador.findAll();
    console.log('✅ Total de prestadores:', todos.length);
    
    // Teste busca por email
    const encontrado = await Prestador.findByEmail("carlos.pg@barber.com");
    console.log('✅ Prestador encontrado:', encontrado.nome);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();