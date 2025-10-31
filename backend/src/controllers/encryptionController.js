const cryptoService = require('../utils/cryptoUtils');

const encryptionController = {
  // Obter métricas de criptografia
  async getMetrics(req, res) {
    try {
      const metrics = cryptoService.getEncryptionMetrics();
      const report = cryptoService.generateSecurityReport();
      
      console.log('📊 Métricas de Criptografia solicitadas:', metrics);

      res.json({
        success: true,
        metric: 'Taxa de dados criptografados',
        formula: 'x = DC ÷ DT × 100',
        values: {
          DC: metrics.DC,
          DT: metrics.DT,
          x: metrics.x
        },
        calculation: `x = ${metrics.DC} ÷ ${metrics.DT} × 100 = ${metrics.x}%`,
        interpretation: report.interpretation,
        status: report.status,
        recommendations: report.recommendations,
        lastUpdated: metrics.lastUpdated
      });
      
    } catch (error) {
      console.error('❌ Erro ao obter métricas de criptografia:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar métricas de segurança'
      });
    }
  },

  // Gerar relatório completo
  async getReport(req, res) {
    try {
      const report = cryptoService.generateSecurityReport();
      
      res.json({
        success: true,
        report: report
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório de segurança'
      });
    }
  },

  // Reset métricas (apenas desenvolvimento)
  async resetMetrics(req, res) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        cryptoService.resetMetrics();
        
        res.json({
          success: true,
          message: 'Métricas de criptografia resetadas',
          newMetrics: cryptoService.getEncryptionMetrics()
        });
      } else {
        res.status(403).json({
          success: false,
          error: 'Operação não permitida em produção'
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao resetar métricas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao resetar métricas'
      });
    }
  }
};

module.exports = encryptionController;