const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

// @route   POST /api/agendamentos
// @desc    Criar novo agendamento
// @access  Private (Clientes)
router.post('/agendamentos', agendamentoController.create);

// @route   GET /api/agendamentos/horarios-disponiveis
// @desc    Buscar horários disponíveis para agendamento
// @access  Private
router.get('/agendamentos/horarios-disponiveis', agendamentoController.getHorariosDisponiveis);

// @route   GET /api/agendamentos
// @desc    Listar todos os agendamentos (Admin)
// @access  Private (Admin)
router.get('/agendamentos', agendamentoController.listAll);

// @route   GET /api/agendamentos/:id
// @desc    Buscar agendamento por ID
// @access  Private
router.get('/agendamentos/:id', agendamentoController.findById);

// @route   GET /api/agendamentos/cliente/:cliente_id
// @desc    Buscar agendamentos por cliente
// @access  Private
router.get('/agendamentos/cliente/:cliente_id', agendamentoController.findByCliente);

// @route   GET /api/agendamentos/prestador/:prestador_id
// @desc    Buscar agendamentos por prestador
// @access  Private
router.get('/agendamentos/prestador/:prestador_id', agendamentoController.findByPrestador);

// @route   PUT /api/agendamentos/:id/status
// @desc    Atualizar status do agendamento
// @access  Private
router.put('/agendamentos/:id/status', agendamentoController.updateStatus);

// @route   GET /api/agendamentos/servico/:servico_id/validar
// @desc    Validar se serviço existe e está ativo
// @access  Public/Private
router.get('/agendamentos/servico/:servico_id/validar', agendamentoController.validarServico);

// @route   POST /api/agendamentos/disponibilidade
// @desc    Verificar disponibilidade do prestador
// @access  Private
router.post('/agendamentos/disponibilidade', agendamentoController.verificarDisponibilidade);

// @route   DELETE /api/agendamentos/:id/cancelar
// @desc    Cancelar agendamento
// @access  Private (Cliente do agendamento)
router.put('/agendamentos/:id/cancelar', agendamentoController.cancelar);

// Rota de health check para agendamentos
router.get('/agendamentos-health', (req, res) => {
  res.json({
    success: true,
    message: 'API de Agendamentos funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: {
      create: 'POST /api/agendamentos',
      horariosDisponiveis: 'GET /api/agendamentos/horarios-disponiveis',
      listAll: 'GET /api/agendamentos',
      findById: 'GET /api/agendamentos/:id',
      findByCliente: 'GET /api/agendamentos/cliente/:cliente_id',
      findByPrestador: 'GET /api/agendamentos/prestador/:prestador_id',
      updateStatus: 'PUT /api/agendamentos/:id/status',
      validarServico: 'GET /api/agendamentos/servico/:servico_id/validar',
      verificarDisponibilidade: 'POST /api/agendamentos/disponibilidade',
      cancelar: 'DELETE /api/agendamentos/:id/cancelar'
    }
  });
});

module.exports = router;