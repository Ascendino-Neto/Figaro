import api from './api';
import { securityService } from './securityService';

export const authService = {
  async login(loginData) {
    try {
      // Coletar informações de segurança
      const ip = await this.getClientIP();
      const userAgent = navigator.userAgent;
      
      console.log('🔐 Tentativa de login:', { 
        email: loginData.email, 
        ip, 
        userAgent: userAgent.substring(0, 50) 
      });

      // Verificar se está bloqueado
      if (securityService.isBlocked(loginData.email, ip)) {
        const errorMsg = '🚫 Conta temporariamente bloqueada por múltiplas tentativas falhas. Tente novamente em 15 minutos.';
        console.warn(errorMsg);
        throw new Error(errorMsg);
      }

      // Detectar padrões suspeitos antes do login
      const suspiciousPatterns = securityService.detectSuspiciousPatterns(
        loginData.email, 
        ip, 
        userAgent
      );

      if (suspiciousPatterns.length > 0) {
        console.warn('⚠️ Padrões suspeitos detectados:', suspiciousPatterns);
      }

      const payload = {
        email: loginData.email,
        senha: loginData.senha
      };
      
      const response = await api.post('/auth/login', payload);
      
      if (response.data.success) {
        // Login bem-sucedido - registrar como legítimo
        securityService.recordLoginAttempt(loginData.email, ip, true, userAgent);
        
        console.log('✅ Login bem-sucedido para:', loginData.email);

        // Salvar dados de autenticação
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userType', response.data.user.tipo);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userName', response.data.user.name || response.data.user.email);
        
        // Salvar informações de segurança para sessão
        localStorage.setItem('loginIP', ip);
        localStorage.setItem('loginUserAgent', userAgent);
        localStorage.setItem('loginTimestamp', Date.now().toString());

        return response.data;
      } else {
        throw new Error(response.data.error);
      }
      
    } catch (error) {
      // Registrar tentativa falha
      const ip = await this.getClientIP();
      const userAgent = navigator.userAgent;
      const attempts = securityService.recordLoginAttempt(
        loginData.email, 
        ip, 
        false, 
        userAgent
      );

      console.error('❌ Falha no login:', {
        email: loginData.email,
        ip,
        attempts,
        error: error.message
      });

      // Mensagem personalizada baseada no número de tentativas
      let errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      
      if (attempts >= 3) {
        const remainingAttempts = securityService.MAX_ATTEMPTS - attempts;
        if (remainingAttempts > 0) {
          errorMessage += `. ${remainingAttempts} tentativa(s) restante(s) antes do bloqueio temporário.`;
        } else {
          errorMessage = '🚫 Muitas tentativas falhas. Sua conta foi temporariamente bloqueada por 15 minutos.';
        }
      }

      throw new Error(errorMessage);
    }
  },

  async logout() {
    // Coletar informações para logs de segurança
    const user = this.getCurrentUser();
    const ip = localStorage.getItem('loginIP');
    
    console.log('👋 Logout realizado:', { 
      email: user?.email, 
      ip,
      timestamp: new Date().toISOString() 
    });

    // Remove dados de autenticação
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('loginIP');
    localStorage.removeItem('loginUserAgent');
    localStorage.removeItem('loginTimestamp');
  },

  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Verificar se a sessão ainda é válida (opcional - pode verificar expiração do token)
    const loginTimestamp = localStorage.getItem('loginTimestamp');
    if (loginTimestamp) {
      const sessionAge = Date.now() - parseInt(loginTimestamp);
      const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
      
      if (sessionAge > maxSessionAge) {
        console.warn('🕒 Sessão expirada, fazendo logout automático');
        this.logout();
        return false;
      }
    }

    return true;
  },

  getCurrentUser() {
    // Verificar se está autenticado primeiro
    if (!this.isAuthenticated()) {
      return null;
    }

    return {
      id: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      type: localStorage.getItem('userType'),
      name: localStorage.getItem('userName'),
      ip: localStorage.getItem('loginIP'),
      loginTime: localStorage.getItem('loginTimestamp')
    };
  },

  async getClientIP() {
    try {
      // Tentar obter IP real do cliente usando serviço externo
      const response = await fetch('https://api.ipify.org?format=json');
      
      if (!response.ok) throw new Error('Falha ao obter IP');
      
      const data = await response.json();
      console.log('🌐 IP do cliente obtido:', data.ip);
      return data.ip;
    } catch (error) {
      console.warn('⚠️ Não foi possível obter IP real, usando fallback:', error.message);
      
      // Fallback: criar um identificador único baseado em user agent e timestamp
      const fallbackIP = `client_${this.hashString(navigator.userAgent)}_${Date.now()}`;
      return fallbackIP.substring(0, 50); // Limitar tamanho
    }
  },

  // Função auxiliar para criar hash simples
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  },

  // Verificar se a sessão atual tem anomalias
  checkSessionAnomalies() {
    const currentIP = localStorage.getItem('loginIP');
    const currentUserAgent = localStorage.getItem('loginUserAgent');
    
    if (!currentIP || !currentUserAgent) {
      return ['session_data_missing'];
    }

    const anomalies = [];

    // Verificar mudança de IP (básico)
    this.getClientIP().then(newIP => {
      if (newIP !== currentIP && !newIP.startsWith('client_')) {
        console.warn('⚠️ Mudança de IP detectada:', { old: currentIP, new: newIP });
        anomalies.push('ip_change');
      }
    }).catch(console.error);

    // Verificar mudança de User Agent
    if (navigator.userAgent !== currentUserAgent) {
      console.warn('⚠️ Mudança de User Agent detectada');
      anomalies.push('user_agent_change');
    }

    return anomalies;
  },

  // Forçar reautenticação se necessário
  async requireReauthentication() {
    const anomalies = this.checkSessionAnomalies();
    
    if (anomalies.length > 0) {
      console.warn('🔒 Anomalias de sessão detectadas, exigindo reautenticação:', anomalies);
      
      // Salvar estado atual para restaurar após reautenticação
      const currentPath = window.location.pathname;
      localStorage.setItem('reauth_redirect', currentPath);
      
      // Fazer logout e redirecionar para login
      this.logout();
      window.location.href = '/login?reason=session_anomaly';
      return false;
    }
    
    return true;
  },

  // Obter métricas de segurança (para dashboard)
  getSecurityMetrics() {
    return securityService.calculateSecurityMetrics();
  },

  // Limpar dados de segurança (para testes/debug)
  clearSecurityData() {
    securityService.cleanupOldData();
    console.log('🧹 Dados de segurança limpos');
  },

  // Verificar status de bloqueio para um usuário
  async getBlockStatus(email) {
    const ip = await this.getClientIP();
    return {
      isBlocked: securityService.isBlocked(email, ip),
      attempts: securityService.getAttemptCount(email, ip),
      maxAttempts: securityService.MAX_ATTEMPTS
    };
  }
};

// Inicialização automática: limpar dados antigos ao carregar
if (typeof window !== 'undefined') {
  // Limpar dados de segurança muito antigos (mais de 1 dia)
  const lastCleanup = localStorage.getItem('lastSecurityCleanup');
  const now = Date.now();
  
  if (!lastCleanup || (now - parseInt(lastCleanup)) > 24 * 60 * 60 * 1000) {
    securityService.cleanupOldData();
    localStorage.setItem('lastSecurityCleanup', now.toString());
  }

  // Verificar sessão ao carregar a página
  window.addEventListener('load', () => {
    if (authService.isAuthenticated()) {
      authService.requireReauthentication().then(isValid => {
        if (!isValid) {
          console.warn('🔄 Sessão invalidada, redirecionando para login...');
        }
      });
    }
  });
}