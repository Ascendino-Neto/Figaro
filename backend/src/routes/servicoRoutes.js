const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

// Cadastrar serviço (apenas prestadores autenticados)
router.post('/servicos', servicoController.create);

// Listar serviços do prestador logado (apenas prestadores autenticados)
router.get('/servicos/prestador', servicoController.getByPrestador);

// ✅ MODIFICADO: Listar todos os serviços (ACESSO PÚBLICO - para clientes)
router.get('/servicos', servicoController.getAll);

// Excluir serviço (apenas prestadores autenticados)
router.delete('/servicos/:id', servicoController.delete);

// ✅ NOVA ROTA: Buscar serviço por ID (ACESSO PÚBLICO)
router.get('/servicos/:id', servicoController.getById);

// ✅ NOVA ROTA: Atualizar serviço (apenas prestadores)
router.put('/servicos/:id', servicoController.update);

// ✅ NOVA ROTA: Health check para serviços
router.get('/servicos-health', (req, res) => {
  res.json({
    success: true,
    message: 'API de Serviços funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      create: 'POST /api/servicos (Prestadores)',
      getAll: 'GET /api/servicos (Público)',
      getById: 'GET /api/servicos/:id (Público)',
      getByPrestador: 'GET /api/servicos/prestador (Prestadores)',
      update: 'PUT /api/servicos/:id (Prestadores)',
      delete: 'DELETE /api/servicos/:id (Prestadores)'
    }
  });
});

module.exports = router;