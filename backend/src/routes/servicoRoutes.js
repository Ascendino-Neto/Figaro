const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

// Cadastrar serviço
router.post('/servicos', servicoController.create);

// Listar serviços do prestador logado
router.get('/servicos/prestador', servicoController.getByPrestador);

// Listar todos os serviços (para clientes)
router.get('/servicos', servicoController.getAll);

// Excluir serviço
router.delete('/servicos/:id', servicoController.delete);

module.exports = router;