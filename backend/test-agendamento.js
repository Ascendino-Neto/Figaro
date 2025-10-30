const Agendamento = require('./src/models/agendamentoModel');

async function test() {
  try {
    console.log('🧪 Testando AgendamentoModel com PostgreSQL...');
    
    // Teste validação de serviço
    const servico = await Agendamento.validarServico(1);
    console.log('✅ Serviço válido:', servico.nome);
    
    // Teste verificar disponibilidade
    const dataTeste = new Date();
    dataTeste.setDate(dataTeste.getDate() + 1);
    dataTeste.setHours(10, 0, 0, 0);
    
    const disponivel = await Agendamento.verificarDisponibilidade(1, dataTeste.toISOString());
    console.log('✅ Horário disponível:', disponivel.disponivel);
    
    if (disponivel.disponivel) {
      // Teste criação de agendamento
      const agendamento = await Agendamento.create({
        cliente_id: 1,
        prestador_id: 1,
        servico_id: 1,
        data_agendamento: dataTeste.toISOString(),
        valor_servico: 30.00,
        observacoes: "Agendamento de teste PostgreSQL"
      });
      
      console.log('✅ Agendamento criado:', agendamento.id);
      
      // Teste busca por ID
      const encontrado = await Agendamento.findById(agendamento.id);
      console.log('✅ Agendamento encontrado:', encontrado.cliente_nome);
      
      // Teste busca por cliente
      const doCliente = await Agendamento.findByClienteId(1);
      console.log('✅ Agendamentos do cliente:', doCliente.length);
    }
    
    // Teste estatísticas
    const stats = await Agendamento.getEstatisticas();
    console.log('✅ Estatísticas:', stats);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();