const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para autenticação (login)
router.post('/auth/login', authController.authenticate);

module.exports = router;