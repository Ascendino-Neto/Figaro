class SecurityService {
  constructor() {
    this.failedAttempts = new Map();
    this.suspiciousPatterns = new Map();
    this.MAX_ATTEMPTS = 5;
    this.LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos
    this.SUSPICIOUS_THRESHOLD = 3;
  }

  // Registrar tentativa de login
  recordLoginAttempt(email, ip, success, userAgent) {
    const key = `${email}_${ip}`;
    const now = Date.now();

    if (!this.failedAttempts.has(key)) {
      this.failedAttempts.set(key, []);
    }

    const attempts = this.failedAttempts.get(key);

    // Limpar tentativas antigas
    const recentAttempts = attempts.filter(time => now - time < this.LOCKOUT_TIME);

    if (!success) {
      recentAttempts.push(now);
      this.failedAttempts.set(key, recentAttempts);

      // Verificar se é suspeito
      if (recentAttempts.length >= this.SUSPICIOUS_THRESHOLD) {
        this.recordSuspiciousActivity(email, ip, 'multiple_failures', userAgent);
      }
    } else {
      // Login bem-sucedido - limpar tentativas
      this.failedAttempts.delete(key);
    }

    return recentAttempts.length;
  }

  // Obter contagem de tentativas
  getAttemptCount(email, ip) {
    const key = `${email}_${ip}`;
    const attempts = this.failedAttempts.get(key) || [];
    const now = Date.now();
    return attempts.filter(time => now - time < this.LOCKOUT_TIME).length;
  }

  // Registrar atividade suspeita
  recordSuspiciousActivity(email, ip, type, userAgent) {
    const activity = {
      email,
      ip,
      type,
      userAgent,
      timestamp: new Date().toISOString(),
      detectedAt: Date.now()
    };

    const key = `${email}_${ip}`;
    this.suspiciousPatterns.set(key, activity);

    console.warn('🚨 ATIVIDADE SUSPEITA DETECTADA:', activity);
    
    // Em produção, enviar para sistema de logs/SIEM
    this.reportToSecuritySystem(activity);
  }

  // Verificar se IP/email está bloqueado
  isBlocked(email, ip) {
    return this.getAttemptCount(email, ip) >= this.MAX_ATTEMPTS;
  }

  // Calcular métrica de segurança
  calculateSecurityMetrics() {
    const totalAttempts = Array.from(this.failedAttempts.values())
      .reduce((total, attempts) => total + attempts.length, 0);
    
    const suspiciousAttempts = this.suspiciousPatterns.size;
    
    const detectionRate = totalAttempts > 0 
      ? (suspiciousAttempts / totalAttempts) * 100 
      : 0;

    return {
      totalAttempts,
      suspiciousAttempts,
      detectionRate: Math.round(detectionRate * 100) / 100,
      blockedUsers: Array.from(this.failedAttempts.entries())
        .filter(([key, attempts]) => {
          const [email, ip] = key.split('_');
          return this.isBlocked(email, ip);
        }).length,
      timestamp: new Date().toISOString()
    };
  }

  // Detectar padrões suspeitos
  detectSuspiciousPatterns(email, ip, userAgent) {
    const patterns = [];

    // Múltiplos user agents para mesmo email
    const userAgentKey = `${email}_useragents`;
    const previousUserAgents = JSON.parse(localStorage.getItem(userAgentKey) || '[]');
    
    if (previousUserAgents.length > 0 && !previousUserAgents.includes(userAgent)) {
      patterns.push('user_agent_change');
    }

    // Atualizar histórico de user agents
    if (!previousUserAgents.includes(userAgent)) {
      previousUserAgents.push(userAgent);
      localStorage.setItem(userAgentKey, JSON.stringify(previousUserAgents.slice(-3)));
    }

    // Horário incomum (meio da noite)
    const hour = new Date().getHours();
    if (hour >= 0 && hour <= 5) {
      patterns.push('unusual_hour');
    }

    // Muitas tentativas em curto período
    const attemptCount = this.getAttemptCount(email, ip);
    if (attemptCount >= 2) {
      patterns.push('multiple_attempts');
    }

    return patterns;
  }

  reportToSecuritySystem(activity) {
    // Em produção, integrar com sistema de logs
    console.log('📡 Reportando atividade suspeita:', activity);
  }

  // Limpar dados antigos periodicamente
  cleanupOldData() {
    const now = Date.now();
    
    // Limpar tentativas antigas
    for (const [key, attempts] of this.failedAttempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < this.LOCKOUT_TIME * 2);
      if (recentAttempts.length === 0) {
        this.failedAttempts.delete(key);
      } else {
        this.failedAttempts.set(key, recentAttempts);
      }
    }
    
    // Limpar padrões suspeitos antigos
    for (const [key, activity] of this.suspiciousPatterns.entries()) {
      if (now - activity.detectedAt > 60 * 60 * 1000) {
        this.suspiciousPatterns.delete(key);
      }
    }
  }
}

// Singleton
export const securityService = new SecurityService();

// Limpeza automática a cada 10 minutos
if (typeof window !== 'undefined') {
  setInterval(() => securityService.cleanupOldData(), 10 * 60 * 1000);
}