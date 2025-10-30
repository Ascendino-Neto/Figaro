const Cliente = require('./src/models/clienteModel');

async function test() {
  try {
    console.log('🧪 Testando ClienteModel com PostgreSQL...');
    
    // Teste criação
    const cliente = await Cliente.create({
      nome: "Maria Teste PostgreSQL",
      cpf: "999.888.777-66",
      telefone: "(11) 97777-8888",
      email: "maria.postgres@teste.com"
    });
    
    console.log('✅ Cliente criado:', cliente);
    
    // Teste busca
    const encontrado = await Cliente.findByCpf("999.888.777-66");
    console.log('✅ Cliente encontrado:', encontrado.nome);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test(); 