const authMetrics = require('../utils/authMetricsUtils');

const authMetricsController = {
  // Obter métricas de autenticação robusta
  async getMetrics(req, res) {
    try {
      const metrics = authMetrics.getMetrics();
      const report = authMetrics.generateReport();
      
      console.log('📊 Métricas de Autenticação Robusta solicitadas:', metrics);

      res.json({
        success: true,
        metric: 'Taxa de autenticação robusta aplicada',
        formula: 'x = LR ÷ LT × 100',
        values: {
          LR: metrics.LR,
          LT: metrics.LT,
          x: metrics.x
        },
        calculation: `x = ${metrics.LR} ÷ ${metrics.LT} × 100 = ${metrics.x}%`,
        interpretation: report.interpretation,
        status: report.status,
        recommendations: report.recommendations,
        criteriaBreakdown: report.criteriaBreakdown,
        lastUpdated: metrics.lastUpdated
      });
      
    } catch (error) {
      console.error('❌ Erro ao obter métricas de autenticação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar métricas de autenticação'
      });
    }
  },

  // Registrar tentativa de login (para ser chamado no login)
  async recordLoginAttempt(req, res) {
    try {
      const loginData = req.body;
      
      const result = authMetrics.recordLoginAttempt(loginData);
      const metrics = authMetrics.getMetrics();

      console.log('🔐 Login registrado:', {
        email: loginData.email,
        isRobust: result.isRobust,
        robustnessScore: result.robustnessScore,
        currentRate: metrics.x
      });

      res.json({
        success: true,
        recorded: true,
        isRobust: result.isRobust,
        robustnessScore: result.robustnessScore,
        currentMetrics: metrics
      });
      
    } catch (error) {
      console.error('❌ Erro ao registrar login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao registrar tentativa de login'
      });
    }
  },

  // Gerar relatório completo
  async getReport(req, res) {
    try {
      const report = authMetrics.generateReport();
      
      res.json({
        success: true,
        report: report
      });
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório de autenticação'
      });
    }
  },

  // Obter histórico recente
  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      
      res.json({
        success: true,
        history: authMetrics.metrics.history.slice(-limit),
        total: authMetrics.metrics.history.length
      });
      
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao obter histórico de autenticação'
      });
    }
  },

  // Reset métricas (apenas desenvolvimento)
  async resetMetrics(req, res) {
    try {
      if (process.env.NODE_ENV !== 'production') {
        authMetrics.resetMetrics();
        
        res.json({
          success: true,
          message: 'Métricas de autenticação resetadas',
          newMetrics: authMetrics.getMetrics()
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

module.exports = authMetricsController;