import api from './api';

export const agendamentoService = {
  // Criar novo agendamento
  async createAgendamento(agendamentoData) {
    try {
      console.log('📝 Enviando dados do agendamento:', agendamentoData);
      
      const response = await api.post('/agendamentos', agendamentoData);
      
      if (response.data.success) {
        console.log('✅ Agendamento criado com sucesso:', response.data.agendamento);
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error.message);
      
      // Mensagens de erro mais amigáveis
      if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        
        if (errorMessage.includes('Serviço não encontrado')) {
          throw new Error('O serviço selecionado não está mais disponível');
        }
        
        if (errorMessage.includes('FOREIGN KEY constraint failed')) {
          throw new Error('Erro nos dados do agendamento. Verifique as informações e tente novamente.');
        }
        
        if (errorMessage.includes('Data de agendamento inválida')) {
          throw new Error('A data selecionada é inválida');
        }
        
        if (errorMessage.includes('datas passadas')) {
          throw new Error('Não é possível agendar para datas passadas');
        }
        
        throw new Error(errorMessage);
      }
      
      if (error.message.includes('Network Error')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      throw new Error('Erro ao processar agendamento. Tente novamente.');
    }
  },

  // Buscar agendamento por ID
  async getAgendamentoById(id) {
    try {
      const response = await api.get(`/agendamentos/${id}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar agendamento:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar agendamento');
    }
  },

  // Buscar agendamentos por cliente
  async getAgendamentosByCliente(cliente_id) {
    try {
      const response = await api.get(`/agendamentos/cliente/${cliente_id}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos do cliente:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar agendamentos');
    }
  },

  // Buscar agendamentos por prestador
  async getAgendamentosByPrestador(prestador_id) {
    try {
      const response = await api.get(`/agendamentos/prestador/${prestador_id}`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos do prestador:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar agendamentos');
    }
  },

  // Atualizar status do agendamento
  async updateStatus(id, status) {
    try {
      const response = await api.put(`/agendamentos/${id}/status`, { status });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar status');
    }
  },

  // Validar serviço
  async validarServico(servico_id) {
    try {
      const response = await api.get(`/agendamentos/servico/${servico_id}/validar`);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao validar serviço:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao validar serviço');
    }
  },

  // Verificar disponibilidade do prestador
  async verificarDisponibilidade(prestador_id, data_agendamento, duracao_minutos = 60) {
    try {
      const response = await api.post('/agendamentos/disponibilidade', {
        prestador_id,
        data_agendamento,
        duracao_minutos
      });
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao verificar disponibilidade');
    }
  },

  // Cancelar agendamento
  async cancelarAgendamento(id, cliente_id) {
    try {
      const response = await api.delete(`/agendamentos/${id}/cancelar`, {
        data: { cliente_id }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao cancelar agendamento');
    }
  },

  // Listar todos os agendamentos (para admin)
  async getAllAgendamentos() {
    try {
      const response = await api.get('/agendamentos');
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao listar agendamentos');
    }
  },

  // Método auxiliar para formatar dados do agendamento
  formatarDadosAgendamento(servicoSelecionado, user) {
    return {
      servico_id: servicoSelecionado.id,
      prestador_id: servicoSelecionado.prestador_id,
      cliente_id: user.id,
      data_agendamento: new Date().toISOString(), // Data atual como placeholder
      valor_servico: servicoSelecionado.valor,
      observacoes: `Agendamento realizado via sistema - ${new Date().toLocaleString('pt-BR')}`
    };
  },

  // Método auxiliar para validar dados antes do envio
  validarDadosAgendamento(agendamentoData) {
    const errors = [];
    
    if (!agendamentoData.servico_id) {
      errors.push('ID do serviço é obrigatório');
    }
    
    if (!agendamentoData.prestador_id) {
      errors.push('ID do prestador é obrigatório');
    }
    
    if (!agendamentoData.cliente_id) {
      errors.push('ID do cliente é obrigatório');
    }
    
    if (!agendamentoData.data_agendamento) {
      errors.push('Data do agendamento é obrigatória');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return true;
  }
};