const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Cadastrar cliente (US 1)
router.post('/clientes', clienteController.create);

// Buscar cliente por CPF
router.get('/clientes/:cpf', clienteController.findByCpf);

module.exports = router;