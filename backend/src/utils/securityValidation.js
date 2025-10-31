// src/utils/securityValidation.js
export const SecurityValidator = {
  // Simular tentativas de login para validar a métrica
  async simulateLoginScenarios() {
    const scenarios = [
      {
        name: 'Cenário Normal - Usuário Legítimo',
        attempts: [
          { email: 'usuario@valido.com', password: 'senhaCorreta', shouldSucceed: true }
        ],
        expectedSuspicious: 0
      },
      {
        name: 'Cenário Força Bruta - Múltiplas Falhas',
        attempts: [
          { email: 'vitima@alvo.com', password: 'senhaErrada1', shouldSucceed: false },
          { email: 'vitima@alvo.com', password: 'senhaErrada2', shouldSucceed: false },
          { email: 'vitima@alvo.com', password: 'senhaErrada3', shouldSucceed: false },
          { email: 'vitima@alvo.com', password: 'senhaErrada4', shouldSucceed: false },
        ],
        expectedSuspicious: 4 // Deve detectar como suspeito
      },
      {
        name: 'Cenário Ataque Dicionário',
        attempts: [
          { email: 'admin@system.com', password: 'admin', shouldSucceed: false },
          { email: 'admin@system.com', password: '123456', shouldSucceed: false },
          { email: 'admin@system.com', password: 'password', shouldSucceed: false },
        ],
        expectedSuspicious: 3
      }
    ];

    const results = [];

    for (const scenario of scenarios) {
      console.log(`\n🔍 Executando: ${scenario.name}`);
      
      let suspiciousDetected = 0;
      
      for (const attempt of scenario.attempts) {
        // Simular tentativa de login
        const isSuspicious = await this.simulateLoginAttempt(
          attempt.email, 
          attempt.password, 
          attempt.shouldSucceed
        );
        
        if (isSuspicious) suspiciousDetected++;
      }

      const isValid = suspiciousDetected >= scenario.expectedSuspicious;
      
      results.push({
        scenario: scenario.name,
        attempts: scenario.attempts.length,
        expectedSuspicious: scenario.expectedSuspicious,
        actualSuspicious: suspiciousDetected,
        valid: isValid,
        metricValue: (suspiciousDetected / scenario.attempts.length) * 100
      });
    }

    return this.generateValidationReport(results);
  },

  async simulateLoginAttempt(email, password, shouldSucceed) {
    // Simular a lógica de detecção do sistema
    const ip = '192.168.1.100'; // IP simulado
    const userAgent = 'Mozilla/5.0 (Test Validation)';
    
    // Usar o securityService real
    const { securityService } = await import('../services/securityService');
    
    // Registrar tentativa
    const attemptsCount = securityService.recordLoginAttempt(
      email, ip, shouldSucceed, userAgent
    );
    
    // Verificar se foi marcado como suspeito
    const suspiciousPatterns = securityService.detectSuspiciousPatterns(email, ip, userAgent);
    
    return suspiciousPatterns.length > 0 || attemptsCount >= 3;
  },

  generateValidationReport(results) {
    const totalTests = results.length;
    const passedTests = results.filter(r => r.valid).length;
    const overallRate = (passedTests / totalTests) * 100;

    console.log('\n📊 RELATÓRIO DE VALIDAÇÃO - MÉTRICA 1');
    console.log('=====================================');
    
    results.forEach(result => {
      console.log(
        result.valid ? '✅' : '❌',
        `${result.scenario}:`,
        `${result.actualSuspicious}/${result.expectedSuspicious} suspeitas detectadas`,
        `(Taxa: ${result.metricValue.toFixed(1)}%)`
      );
    });

    console.log('\n📈 RESUMO DA VALIDAÇÃO:');
    console.log(`Testes Passados: ${passedTests}/${totalTests}`);
    console.log(`Taxa de Sucesso: ${overallRate.toFixed(1)}%`);
    console.log(`Status: ${overallRate >= 80 ? '✅ VALIDADO' : '❌ NECESSITA AJUSTES'}`);

    return {
      overallRate,
      isValid: overallRate >= 80,
      details: results
    };
  }
};