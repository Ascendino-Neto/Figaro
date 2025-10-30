const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const securityMiddleware = require('../middleware/securityMiddleware');

// ✅ ROTA: Cadastrar cliente (SEM middlewares complexos por enquanto)
router.post('/clientes', clienteController.create);

// ✅ ROTA: Buscar cliente por CPF
router.get('/clientes/:cpf', clienteController.findByCpf);

// ✅ ROTA: Health check simplificada
router.get('/clientes-health', (req, res) => {
  res.json({
    success: true,
    message: 'API de Clientes funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      create: 'POST /api/clientes',
      findByCpf: 'GET /api/clientes/:cpf'
    }
  });
});

module.exports = router;