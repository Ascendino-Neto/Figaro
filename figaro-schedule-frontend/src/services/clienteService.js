import api from './api';

export const clienteService = {
  async createCliente(clienteData) {
    try {
      const response = await api.post('/clientes', clienteData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao cadastrar cliente');
    }
  },

  async getClienteByCpf(cpf) {
    try {
      const response = await api.get(`/clientes/${cpf}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar cliente');
    }
  }
};