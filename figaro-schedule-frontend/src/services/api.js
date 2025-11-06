import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Instância principal do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções específicas para reagendamento
export const reagendamentoAPI = {
  solicitarReagendamento: (dados) => api.post('/reagendamentos/solicitar', dados),
  getHorariosDisponiveis: (prestadorId) => api.get(`/prestadores/${prestadorId}/horarios-disponiveis`),
  getSolicitacoesReagendamento: () => api.get('/reagendamentos/solicitacoes'),
  confirmarReagendamento: (solicitacaoId) => api.put(`/reagendamentos/${solicitacaoId}/confirmar`),
  recusarReagendamento: (solicitacaoId) => api.put(`/reagendamentos/${solicitacaoId}/recusar`),
};

// Funções mock para desenvolvimento (enquanto as rotas não existem)
export const mockAPI = {
  // Mock para cancelar agendamento
  cancelarAgendamento: async (agendamentoId) => {
    console.log('?? Mock: Cancelando agendamento', agendamentoId);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retorna sucesso (em produção, isso viria do backend)
    return {
      data: {
        id: agendamentoId,
        status: 'cancelado',
        message: 'Agendamento cancelado com sucesso'
      }
    };
  },

  // Mock para buscar horários disponíveis
  getHorariosDisponiveisMock: async (prestadorId) => {
    console.log('?? Mock: Buscando horários para prestador', prestadorId);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Gera datas dos próximos 7 dias
    const horariosDisponiveis = {};
    const hoje = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      // Gera horários fictícios (9h às 18h, a cada hora)
      const horarios = [];
      for (let hora = 9; hora <= 18; hora++) {
        horarios.push(`${hora.toString().padStart(2, '0')}:00`);
      }
      
      horariosDisponiveis[dataStr] = horarios;
    }
    
    return { data: horariosDisponiveis };
  },

  // Mock para solicitar reagendamento
  solicitarReagendamentoMock: async (dados) => {
    console.log('?? Mock: Solicitando reagendamento', dados);
    
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        id: Math.random().toString(36).substr(2, 9),
        ...dados,
        status: 'pendente',
        message: 'Reagendamento solicitado com sucesso',
        data_anterior: new Date().toISOString(),
        horario_anterior: '15:00',
        servico_nome: dados.servico_nome || 'Serviço de Barbearia',
        prestador_nome: 'Prestador Mock'
      }
    };
  },

  // Mock para estatísticas do admin
  getEstatisticasAdmin: async () => {
    console.log('?? Mock: Buscando estatísticas para admin');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: {
        totalUsuarios: 156,
        totalPrestadores: 23,
        totalClientes: 133,
        agendamentosHoje: 8,
        agendamentosRecentes: [
          {
            id: 1,
            servico_nome: 'Corte de Cabelo',
            cliente_nome: 'João Silva',
            prestador_nome: 'Carlos Barber',
            data: '2024-01-15',
            horario: '14:00',
            status: 'confirmado'
          },
          {
            id: 2,
            servico_nome: 'Barba',
            cliente_nome: 'Maria Santos',
            prestador_nome: 'Pedro Style',
            data: '2024-01-15',
            horario: '15:30',
            status: 'pendente'
          },
          {
            id: 3,
            servico_nome: 'Corte + Barba',
            cliente_nome: 'Ana Oliveira',
            prestador_nome: 'Carlos Barber',
            data: '2024-01-15',
            horario: '16:00',
            status: 'concluído'
          },
          {
            id: 4,
            servico_nome: 'Sobrancelha',
            cliente_nome: 'Pedro Costa',
            prestador_nome: 'Maria Beauty',
            data: '2024-01-15',
            horario: '17:00',
            status: 'confirmado'
          }
        ]
      }
    };
  },

  // Mock para gerenciar usuários
  getUsuarios: async () => {
    console.log('?? Mock: Buscando usuários para admin');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: [
        {
          id: 1,
          nome: 'João Silva',
          email: 'joao@email.com',
          tipo: 'cliente',
          status: 'ativo',
          data_cadastro: '2024-01-01',
          telefone: '(11) 99999-9999'
        },
        {
          id: 2,
          nome: 'Carlos Barber',
          email: 'carlos@barber.com',
          tipo: 'prestador',
          status: 'ativo',
          data_cadastro: '2024-01-02',
          telefone: '(11) 98888-8888'
        },
        {
          id: 3,
          nome: 'Maria Santos',
          email: 'maria@email.com',
          tipo: 'cliente',
          status: 'ativo',
          data_cadastro: '2024-01-03',
          telefone: '(11) 97777-7777'
        },
        {
          id: 4,
          nome: 'Pedro Style',
          email: 'pedro@style.com',
          tipo: 'prestador',
          status: 'pendente',
          data_cadastro: '2024-01-04',
          telefone: '(11) 96666-6666'
        },
        {
          id: 5,
          nome: 'Administrador Sistema',
          email: 'admin@figaro.com',
          tipo: 'administrador',
          status: 'ativo',
          data_cadastro: '2024-01-01',
          telefone: '(11) 95555-5555'
        }
      ]
    };
  },

  // Mock para gerenciar prestadores
  getPrestadores: async () => {
    console.log('?? Mock: Buscando prestadores para admin');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      data: [
        {
          id: 2,
          nome: 'Carlos Barber',
          email: 'carlos@barber.com',
          especialidade: 'Cabelo e Barba',
          status: 'ativo',
          avaliacao: 4.8,
          total_servicos: 45,
          data_cadastro: '2024-01-02'
        },
        {
          id: 4,
          nome: 'Pedro Style',
          email: 'pedro@style.com',
          especialidade: 'Cortes Modernos',
          status: 'pendente',
          avaliacao: 0,
          total_servicos: 0,
          data_cadastro: '2024-01-04'
        },
        {
          id: 6,
          nome: 'Ana Cabeleireira',
          email: 'ana@hair.com',
          especialidade: 'Coloração',
          status: 'ativo',
          avaliacao: 4.9,
          total_servicos: 32,
          data_cadastro: '2024-01-06'
        },
        {
          id: 7,
          nome: 'Marcos Tradicional',
          email: 'marcos@barber.com',
          especialidade: 'Cortes Clássicos',
          status: 'suspenso',
          avaliacao: 4.2,
          total_servicos: 28,
          data_cadastro: '2024-01-07'
        }
      ]
    };
  },

  // Mock para relatórios
  getRelatorios: async () => {
    console.log('?? Mock: Buscando relatórios para admin');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return {
      data: {
        relatorioUsuarios: {
          total: 156,
          novosEsteMes: 23,
          crescimento: 15
        },
        relatorioAgendamentos: {
          totalEsteMes: 189,
          confirmados: 156,
          cancelados: 12,
          reagendamentos: 21
        },
        relatorioFinanceiro: {
          faturamentoTotal: 12560.00,
          faturamentoEsteMes: 3240.00,
          ticketMedio: 85.30
        },
        topPrestadores: [
          { nome: 'Carlos Barber', servicos: 45, avaliacao: 4.8 },
          { nome: 'Ana Cabeleireira', servicos: 32, avaliacao: 4.9 },
          { nome: 'João Barbeiro', servicos: 28, avaliacao: 4.7 }
        ]
      }
    };
  }
};

// Exporta tanto a instância padrão quanto as funções específicas
export { api };
export default api;