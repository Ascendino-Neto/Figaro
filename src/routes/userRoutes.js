const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rotas de usuários
router.post('/usuarios', userController.create);
router.get('/usuarios', userController.listAll);
router.get('/usuarios/:email', userController.findByEmail);

module.exports = router;