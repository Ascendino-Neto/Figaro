// src/utils/securityChecklist.js
export const SecurityMetricChecklist = {
  checklist: [
    {
      id: 1,
      description: 'Fórmula x = LS ÷ LT × 100 está implementada corretamente',
      validator: (metrics) => {
        const calculated = metrics.LT > 0 ? (metrics.LS / metrics.LT) * 100 : 0;
        return Math.abs(calculated - metrics.x) < 0.01;
      },
      weight: 30
    },
    {
      id: 2,
      description: 'LS (logins suspeitos) está sendo contabilizado corretamente',
      validator: (metrics, securityService) => {
        return securityService.suspiciousPatterns.size === metrics.LS;
      },
      weight: 25
    },
    {
      id: 3,
      description: 'LT (tentativas totais) inclui todas as tentativas de login',
      validator: (metrics, securityService) => {
        const totalFromService = Array.from(securityService.failedAttempts.values())
          .reduce((sum, attempts) => sum + attempts.length, 0);
        return totalFromService === metrics.LT;
      },
      weight: 25
    },
    {
      id: 4,
      description: 'Taxa x está dentro do range 0 ≤ x ≤ 100%',
      validator: (metrics) => metrics.x >= 0 && metrics.x <= 100,
      weight: 10
    },
    {
      id: 5,
      description: 'Sistema detecta corretamente padrões suspeitos',
      validator: async () => {
        const validator = await import('./securityValidation');
        const results = await validator.SecurityValidator.simulateLoginScenarios();
        return results.overallRate >= 80;
      },
      weight: 10
    }
  ],

  async runCompleteValidation() {
    const { securityService } = await import('./securityService');
    const metrics = securityService.calculateSecurityMetrics();
    
    let totalScore = 0;
    const results = [];

    for (const item of this.checklist) {
      const isValid = await item.validator(metrics, securityService);
      const score = isValid ? item.weight : 0;
      totalScore += score;

      results.push({
        item: item.description,
        status: isValid ? '✅' : '❌',
        score: `${score}/${item.weight}`,
        weight: item.weight
      });
    }

    const finalScore = totalScore;
    const isApproved = finalScore >= 80;

    return {
      finalScore,
      isApproved,
      results,
      metrics
    };
  }
};