class AuthMetrics {
  constructor() {
    this.metrics = {
      robustLogins: 0,        // LR
      totalLogins: 0,         // LT
      robustnessRate: 0,      // x
      lastUpdated: new Date(),
      history: [],
      // Critérios para considerar um login como "robusto"
      robustnessCriteria: {
        requiresMFA: false,           // Autenticação multifator
        strongPassword: true,         // Senha forte verificada
        deviceVerification: false,    // Verificação de dispositivo
        biometricAuth: false,         // Autenticação biométrica
        timeBasedRestrictions: true,  // Restrições por horário
        geoVerification: false        // Verificação geográfica
      }
    };
  }

  // Registrar uma tentativa de login
  recordLoginAttempt(loginData) {
    this.metrics.totalLogins++; // LT

    // Verificar se é um login robusto
    const isRobust = this.evaluateLoginRobustness(loginData);
    
    if (isRobust) {
      this.metrics.robustLogins++; // LR
    }

    // Recalcular taxa
    this.metrics.robustnessRate = this.metrics.totalLogins > 0
      ? (this.metrics.robustLogins / this.metrics.totalLogins) * 100
      : 0;

    this.metrics.lastUpdated = new Date();

    // Manter histórico
    this.metrics.history.push({
      timestamp: new Date(),
      email: loginData.email,
      isRobust: isRobust,
      criteria: this.getRobustnessCriteria(loginData),
      currentRate: this.metrics.robustnessRate
    });

    if (this.metrics.history.length > 1000) {
      this.metrics.history = this.metrics.history.slice(-1000);
    }

    return {
      isRobust,
      robustnessScore: this.calculateRobustnessScore(loginData)
    };
  }

  // Avaliar a robustez do login
  evaluateLoginRobustness(loginData) {
    let score = 0;
    const maxScore = 100;
    
    // Critérios de robustez (pontuação)
    if (this.hasStrongPassword(loginData)) score += 30;
    if (this.hasDeviceVerification(loginData)) score += 25;
    if (this.hasTimeBasedRestrictions(loginData)) score += 20;
    if (this.hasGeoVerification(loginData)) score += 15;
    if (this.hasMFASetup(loginData)) score += 10;

    // Considerar robusto se score >= 60 (limite ajustável)
    return score >= 60;
  }

  // Calcular score de robustez (0-100)
  calculateRobustnessScore(loginData) {
    let score = 0;
    
    if (this.hasStrongPassword(loginData)) score += 30;
    if (this.hasDeviceVerification(loginData)) score += 25;
    if (this.hasTimeBasedRestrictions(loginData)) score += 20;
    if (this.hasGeoVerification(loginData)) score += 15;
    if (this.hasMFASetup(loginData)) score += 10;

    return score;
  }

  // Verificar senha forte
  hasStrongPassword(loginData) {
    // Implementar verificação de força da senha
    const password = loginData.password || '';
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /\d/.test(password) && 
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
  }

  // Verificar verificação de dispositivo
  hasDeviceVerification(loginData) {
    // Verificar se é um dispositivo conhecido/verificado
    return loginData.deviceToken && loginData.deviceVerified === true;
  }

  // Verificar restrições de horário
  hasTimeBasedRestrictions(loginData) {
    // Verificar se está dentro do horário comercial
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 18; // 8h às 18h
  }

  // Verificar verificação geográfica
  hasGeoVerification(loginData) {
    // Verificar se o IP está em localização esperada
    return loginData.trustedLocation === true;
  }

  // Verificar se tem MFA configurado
  hasMFASetup(loginData) {
    // Verificar se o usuário tem MFA habilitado
    return loginData.mfaEnabled === true;
  }

  // Obter critérios atendidos
  getRobustnessCriteria(loginData) {
    return {
      strongPassword: this.hasStrongPassword(loginData),
      deviceVerification: this.hasDeviceVerification(loginData),
      timeBasedRestrictions: this.hasTimeBasedRestrictions(loginData),
      geoVerification: this.hasGeoVerification(loginData),
      mfaEnabled: this.hasMFASetup(loginData),
      overallScore: this.calculateRobustnessScore(loginData)
    };
  }

  // Obter métricas atuais
  getMetrics() {
    return {
      LR: this.metrics.robustLogins,           // Logins Robustos
      LT: this.metrics.totalLogins,            // Total de Logins
      x: Math.round(this.metrics.robustnessRate * 100) / 100,  // Taxa
      formula: 'x = LR ÷ LT × 100',
      lastUpdated: this.metrics.lastUpdated,
      historySize: this.metrics.history.length
    };
  }

  // Gerar relatório
  generateReport() {
    const metrics = this.getMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      metric: 'Taxa de autenticação robusta aplicada',
      formula: 'x = LR ÷ LT × 100',
      values: {
        LR: metrics.LR,
        LT: metrics.LT,
        x: metrics.x
      },
      interpretation: this.getInterpretation(metrics.x),
      status: this.getStatus(metrics.x),
      recommendations: this.getRecommendations(metrics.x),
      criteriaBreakdown: this.getCriteriaBreakdown()
    };
  }

  getInterpretation(rate) {
    if (rate >= 90) return 'Excelente - Quase todos os logins usam autenticação robusta';
    if (rate >= 70) return 'Bom - Maioria dos logins usa autenticação robusta';
    if (rate >= 50) return 'Regular - Metade dos logins usa autenticação robusta';
    return 'Crítico - Poucos logins usam autenticação robusta';
  }

  getStatus(rate) {
    if (rate >= 90) return 'EXCELLENT';
    if (rate >= 70) return 'GOOD';
    if (rate >= 50) return 'FAIR';
    return 'POOR';
  }

  getRecommendations(rate) {
    const recommendations = [];
    
    if (rate < 100) {
      recommendations.push('Implementar autenticação multifator (MFA)');
    }
    
    if (rate < 80) {
      recommendations.push('Forçar uso de senhas mais fortes');
      recommendations.push('Implementar verificação de dispositivo');
    }
    
    if (rate < 60) {
      recommendations.push('Adicionar verificação geográfica');
      recommendations.push('Implementar restrições de horário de acesso');
    }
    
    return recommendations;
  }

  getCriteriaBreakdown() {
    const recentLogins = this.metrics.history.slice(-100); // Últimos 100 logins
    const criteriaCount = {
      strongPassword: 0,
      deviceVerification: 0,
      timeBasedRestrictions: 0,
      geoVerification: 0,
      mfaEnabled: 0
    };

    recentLogins.forEach(login => {
      if (login.criteria.strongPassword) criteriaCount.strongPassword++;
      if (login.criteria.deviceVerification) criteriaCount.deviceVerification++;
      if (login.criteria.timeBasedRestrictions) criteriaCount.timeBasedRestrictions++;
      if (login.criteria.geoVerification) criteriaCount.geoVerification++;
      if (login.criteria.mfaEnabled) criteriaCount.mfaEnabled++;
    });

    return criteriaCount;
  }

  // Reset métricas (apenas para testes)
  resetMetrics() {
    this.metrics = {
      robustLogins: 0,
      totalLogins: 0,
      robustnessRate: 0,
      lastUpdated: new Date(),
      history: [],
      robustnessCriteria: this.metrics.robustnessCriteria
    };
  }
}

// Singleton
const authMetrics = new AuthMetrics();

module.exports = authMetrics;