const express = require('express');
const router = express.Router();
const encryptionController = require('../controllers/encryptionController');

// Rotas de métricas de criptografia
router.get('/encryption/metrics', encryptionController.getMetrics);
router.get('/encryption/report', encryptionController.getReport);
router.delete('/encryption/metrics/reset', encryptionController.resetMetrics);

module.exports = router;