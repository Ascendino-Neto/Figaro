const express = require('express');
const router = express.Router();
const clienteLoginController = require('../controllers/clienteLoginController');

// Criar login do cliente
router.post('/clientes/login', clienteLoginController.create);
router.get('/clientes/login/:email', clienteLoginController.findByEmail);

module.exports = router;
