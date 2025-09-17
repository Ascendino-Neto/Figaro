const express = require('express');
const router = express.Router();
const prestadorLoginController = require('../controllers/prestadorLoginController');

// Criar login do prestador
router.post('/prestadores/login', prestadorLoginController.create);
router.get('/prestadores/login/:email', prestadorLoginController.findByEmail);

module.exports = router;
