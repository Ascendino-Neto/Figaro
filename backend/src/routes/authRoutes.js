const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ✅ ROTA DE LOGIN (sem middlewares complexos por enquanto)
router.post('/auth/login', authController.authenticate);

// ✅ ROTA DE HEALTH CHECK
router.get('/auth/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema de autenticação funcionando',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;