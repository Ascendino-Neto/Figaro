import api from './api';

export const prestadorService = {
  async createPrestador(prestadorData) {
    try {
      const response = await api.post('/prestadores', prestadorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao cadastrar prestador');
    }
  },

  async getAllPrestadores() {
    try {
      const response = await api.get('/prestadores');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar prestadores');
    }
  },

  async getPrestadorByEmail(email) {
    try {
      const response = await api.get(`/prestadores/login/${email}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar prestador');
    }
  }
};