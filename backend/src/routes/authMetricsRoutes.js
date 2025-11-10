const express = require('express');
const router = express.Router();
const authMetricsController = require('../controllers/authMetricsController');

// Rotas de métricas de autenticação robusta
router.get('/auth-metrics/metrics', authMetricsController.getMetrics);
router.post('/auth-metrics/record-login', authMetricsController.recordLoginAttempt);
router.get('/auth-metrics/report', authMetricsController.getReport);
router.get('/auth-metrics/history', authMetricsController.getHistory);
router.delete('/auth-metrics/metrics/reset', authMetricsController.resetMetrics);

module.exports = router;