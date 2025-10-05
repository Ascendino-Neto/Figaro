import api from './api';
import { authService } from './authService';

export const servicoService = {
  // Criar novo serviço (apenas prestadores)
  async createServico(servicoData) {
    try {
      console.log('📝 Enviando dados do serviço:', servicoData);
      
      const response = await api.post('/servicos', servicoData);
      
      if (response.data.success) {
        console.log('✅ Serviço criado com sucesso:', response.data.servico);
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao criar serviço:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao cadastrar serviço');
    }
  },

  // Buscar serviços do prestador logado
  async getServicosByPrestador() {
    try {
      const response = await api.get('/servicos/prestador');
      
      if (response.data.success) {
        return response.data.servicos;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviços do prestador:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar serviços');
    }
  },

  // Buscar todos os serviços (para clientes - acesso público)
  async getAllServicos() {
    try {
      const response = await api.get('/servicos');
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar todos os serviços:', error.message);
      
      // Mensagens de erro mais amigáveis
      if (error.message.includes('Network Error')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      throw new Error(error.response?.data?.error || 'Erro ao carregar serviços disponíveis');
    }
  },

  // Buscar serviços disponíveis (apenas serviços ativos)
  async getServicosDisponiveis() {
    try {
      const response = await api.get('/servicos');
      
      if (response.data.success) {
        // Filtra apenas serviços ativos
        const servicosAtivos = {
          ...response.data,
          servicos: response.data.servicos.filter(servico => servico.ativo !== 0)
        };
        return servicosAtivos;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviços disponíveis:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao carregar serviços disponíveis');
    }
  },

  // Buscar serviço por ID
  async getServicoById(id) {
    try {
      // Primeiro busca todos os serviços
      const response = await api.get('/servicos');
      
      if (response.data.success) {
        // Encontra o serviço específico
        const servico = response.data.servicos.find(s => s.id === parseInt(id));
        
        if (!servico) {
          throw new Error('Serviço não encontrado');
        }
        
        return servico;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviço por ID:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar serviço');
    }
  },

  // Atualizar serviço
  async updateServico(id, servicoData) {
    try {
      // Nota: Esta rota precisa ser implementada no backend
      const response = await api.put(`/servicos/${id}`, servicoData);
      
      if (response.data.success) {
        console.log('✅ Serviço atualizado com sucesso:', response.data.servico);
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao atualizar serviço');
    }
  },

  // Excluir serviço
  async deleteServico(id) {
    try {
      const response = await api.delete(`/servicos/${id}`);
      
      if (response.data.success) {
        console.log('✅ Serviço excluído com sucesso');
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao excluir serviço:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao excluir serviço');
    }
  },

  // Buscar serviços por prestador específico
  async getServicosByPrestadorId(prestador_id) {
    try {
      const response = await api.get('/servicos');
      
      if (response.data.success) {
        // Filtra serviços por prestador
        const servicosPrestador = response.data.servicos.filter(
          servico => servico.prestador_id === prestador_id && servico.ativo !== 0
        );
        
        return {
          success: true,
          servicos: servicosPrestador,
          total: servicosPrestador.length
        };
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviços do prestador:', error.message);
      throw new Error(error.response?.data?.error || 'Erro ao buscar serviços do prestador');
    }
  },

  // Validar dados do serviço antes do envio
  validarDadosServico(servicoData) {
    const errors = [];
    
    if (!servicoData.nome || servicoData.nome.trim() === '') {
      errors.push('Nome do serviço é obrigatório');
    }
    
    if (!servicoData.local_atendimento || servicoData.local_atendimento.trim() === '') {
      errors.push('Local de atendimento é obrigatório');
    }
    
    if (servicoData.valor && servicoData.valor < 0) {
      errors.push('Valor não pode ser negativo');
    }
    
    if (servicoData.tempo_duracao && servicoData.tempo_duracao < 1) {
      errors.push('Tempo de duração deve ser pelo menos 1 minuto');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    return true;
  },

  // Formatar dados do serviço para exibição
  formatarServicoParaExibicao(servico) {
    return {
      id: servico.id,
      nome: servico.nome || 'Serviço sem nome',
      descricao: servico.descricao || 'Sem descrição',
      local_atendimento: servico.local_atendimento || 'Local não informado',
      tecnicas_utilizadas: servico.tecnicas_utilizadas || 'Não especificado',
      valor: servico.valor || null,
      tempo_duracao: servico.tempo_duracao || null,
      prestador_id: servico.prestador_id,
      prestador_nome: servico.prestador_nome || 'Prestador não identificado',
      ativo: servico.ativo !== undefined ? servico.ativo : true,
      criado_em: servico.criado_em || new Date().toISOString()
    };
  },

  // Formatar valor para exibição
  formatarValor(valor) {
    if (!valor) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  },

  // Formatar duração para exibição
  formatarDuracao(minutos) {
    if (!minutos) return 'A definir';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
  }
};