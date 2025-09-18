const express = require('express');
const router = express.Router();
const prestadorController = require('../controllers/prestadorController');

// Cadastro e listagem de prestadores
router.post('/prestadores', prestadorController.create);
router.get('/prestadores', prestadorController.listAll);

module.exports = router;