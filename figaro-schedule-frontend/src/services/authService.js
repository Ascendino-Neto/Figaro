import api from './api';

export const authService = {
  async login(loginData) {
    try {
      // ? Agora usa a rota de AUTENTICA��O, n�o de cria��o
      const payload = {
        email: loginData.email,
        senha: loginData.senha
      };
      
      const response = await api.post('/auth/login', payload);
      
      if (response.data.success) {
        // Salva os dados de autentica��o
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userType', response.data.user.tipo);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name);
        
        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  },

  async logout() {
    // Remove dados de autenticação
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
  },

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  getCurrentUser() {
    return {
      id: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      type: localStorage.getItem('userType'),
      name: localStorage.getItem('userName')
    };
  }
};