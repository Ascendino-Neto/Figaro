const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para autentica��o (login)
router.post('/auth/login', authController.authenticate);

module.exports = router;