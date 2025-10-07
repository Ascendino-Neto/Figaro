// Utilitários para datas e horários
const dateUtils = {
  // Gerar horários disponíveis para um período
  gerarHorariosDisponiveis(prestador_id, servico_id, dias = 7, duracaoServico = 60) {
    const horariosDisponiveis = [];
    const agora = new Date();
    
    // Horário de funcionamento da barbearia (exemplo: 8h às 18h)
    const horaInicio = 8; // 8:00
    const horaFim = 18;   // 18:00
    
    // Gerar horários para os próximos X dias
    for (let i = 0; i < dias; i++) {
      const data = new Date(agora);
      data.setDate(agora.getDate() + i);
      data.setHours(0, 0, 0, 0);
      
      // Pular finais de semana (sábado=6, domingo=0)
      if (data.getDay() === 0 || data.getDay() === 6) {
        continue;
      }
      
      // Gerar horários ao longo do dia (de 30 em 30 minutos)
      for (let hora = horaInicio; hora < horaFim; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
          const horario = new Date(data);
          horario.setHours(hora, minuto, 0, 0);
          
          // Não gerar horários no passado
          if (horario > agora) {
            horariosDisponiveis.push(horario.toISOString());
          }
        }
      }
    }
    
    return horariosDisponiveis;
  },

  // Verificar se um horário está dentro do expediente
  isExpediente(horario) {
    const data = new Date(horario);
    const hora = data.getHours();
    const diaSemana = data.getDay();
    
    // Expediente: Segunda a Sexta, 8h às 18h
    return diaSemana >= 1 && diaSemana <= 5 && hora >= 8 && hora < 18;
  },

  // Formatar data para exibição
  formatarData(horario) {
    return new Date(horario).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  },

  // Formatar hora para exibição
  formatarHora(horario) {
    return new Date(horario).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calcular horário de término baseado na duração
  calcularHorarioTermino(horarioInicio, duracaoMinutos) {
    const horario = new Date(horarioInicio);
    horario.setMinutes(horario.getMinutes() + duracaoMinutos);
    return horario.toISOString();
  },

  // Verificar se duas faixas de horário se sobrepõem
  hasSobreposicao(inicio1, fim1, inicio2, fim2) {
    return new Date(inicio1) < new Date(fim2) && new Date(fim1) > new Date(inicio2);
  },

  // Validar se a data não é no passado
  isDataFutura(horario) {
    return new Date(horario) > new Date();
  }
};

module.exports = dateUtils;