import api from './api';

export const prestadorService = {
  // Cadastrar prestador
  async createPrestador(prestadorData) {
    try {
      const response = await api.post('/prestadores', prestadorData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao cadastrar prestador');
    }
  },

  // Listar todos os prestadores
  async getAllPrestadores() {
    try {
      const response = await api.get('/prestadores');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar prestadores');
    }
  },

  // Buscar prestador por email
  async getPrestadorByEmail(email) {
    try {
      const response = await api.get(`/prestadores/login/${email}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao buscar prestador');
    }
  }
};