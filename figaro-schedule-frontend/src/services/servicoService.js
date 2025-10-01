import api from './api';
import { authService } from './authService';

export const servicoService = {
  async createServico(servicoData) {
    try {
      const response = await api.post('/servicos', servicoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao cadastrar serviço');
    }
  },

  async getServicosByPrestador() {
    try {
      const response = await api.get('/servicos/prestador');
      return response.data.servicos;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar serviços');
    }
  },

  async getAllServicos() {
    try {
      const response = await api.get('/servicos');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar serviços');
    }
  },

  async deleteServico(id) {
    try {
      const response = await api.delete(`/servicos/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao excluir serviço');
    }
  }
};