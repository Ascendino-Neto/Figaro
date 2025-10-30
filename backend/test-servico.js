const Servico = require('./src/models/servicoModel');

async function test() {
  try {
    console.log('🧪 Testando ServicoModel com PostgreSQL...');
    
    // Teste criação
    const servico = await Servico.create({
      nome: "Corte Premium PostgreSQL",
      descricao: "Corte especial com técnicas avançadas",
      local_atendimento: "Barbearia Central",
      tecnicas_utilizadas: "Degradê, tesoura, máquina",
      valor: 50.00,
      tempo_duracao: 45,
      prestador_id: 1
    });
    
    console.log('✅ Serviço criado:', servico.nome);
    
    // Teste busca todos
    const todos = await Servico.findAll();
    console.log('✅ Total de serviços:', todos.length);
    
    // Teste busca por prestador
    const doPrestador = await Servico.findByPrestadorId(1);
    console.log('✅ Serviços do prestador:', doPrestador.length);
    
    // Teste busca ativos
    const ativos = await Servico.findAtivos();
    console.log('✅ Serviços ativos:', ativos.length);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();