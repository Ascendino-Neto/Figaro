const Agendamento = require('../models/agendamentoModel');
const db = require('../config/db');

const agendamentoController = {
  // Criar novo agendamento
  async create(req, res) {
    try {
      console.log('📝 Criando novo agendamento:', req.body);
     
      const {
        servico_id,
        prestador_id,
        cliente_id,
        data_agendamento,
        valor_servico,
        observacoes
      } = req.body;

      // Validações básicas
      if (!servico_id || !prestador_id || !cliente_id || !data_agendamento) {
        return res.status(400).json({
          success: false,
          error: 'servico_id, prestador_id, cliente_id e data_agendamento são obrigatórios'
        });
      }

      // Validar data
      const dataAgendamento = new Date(data_agendamento);
      if (isNaN(dataAgendamento.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Data de agendamento inválida'
        });
      }

      // Verificar se a data não é no passado
      const agora = new Date();
      if (dataAgendamento < agora) {
        return res.status(400).json({
          success: false,
          error: 'Não é possível agendar para datas passadas'
        });
      }

      const agendamentoData = {
        servico_id,
        prestador_id,
        cliente_id,
        data_agendamento: dataAgendamento.toISOString(),
        valor_servico: valor_servico || null,
        observacoes: observacoes || null
      };

      // ✅ MUDANÇA: await em vez de Promise
      const agendamento = await Agendamento.create(agendamentoData);
     
      console.log('✅ Agendamento criado com sucesso:', agendamento.id);

      res.status(201).json({
        success: true,
        message: 'Agendamento realizado com sucesso!',
        agendamento
      });

    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error.message);
     
      if (error.message.includes('Serviço não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('Horário indisponível')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('FOREIGN KEY') || error.message.includes('Cliente, prestador ou serviço inválido')) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos: cliente, prestador ou serviço não encontrado'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno ao criar agendamento: ' + error.message
      });
    }
  },

  // ✅ BUSCAR horários disponíveis para agendamento (CORRIGIDO)
  async getHorariosDisponiveis(req, res) {
    try {
      const { prestador_id, servico_id, dias = 7 } = req.query;

      console.log('🕐 Buscando horários disponíveis:', { prestador_id, servico_id, dias });

      // Validações
      if (!prestador_id || !servico_id) {
        return res.status(400).json({
          success: false,
          error: 'prestador_id e servico_id são obrigatórios'
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const prestadorExiste = await db.get("SELECT id FROM prestadores WHERE id = $1", [prestador_id]);

      if (!prestadorExiste) {
        return res.status(404).json({
          success: false,
          error: 'Prestador não encontrado'
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const horariosDisponiveis = await Agendamento.getHorariosDisponiveis(
        parseInt(prestador_id),
        parseInt(servico_id),
        parseInt(dias)
      );

      res.json({
        success: true,
        horarios: horariosDisponiveis.horarios,
        total: horariosDisponiveis.total,
        duracao_servico: horariosDisponiveis.duracao_servico,
        message: `${horariosDisponiveis.total} horários disponíveis encontrados`
      });

    } catch (error) {
      console.error('❌ Erro ao buscar horários disponíveis:', error.message);
     
      if (error.message.includes('Serviço não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar horários disponíveis: ' + error.message
      });
    }
  },

  // Buscar agendamento por ID
  async findById(req, res) {
    try {
      // ✅ MUDANÇA: await em vez de Promise
      const agendamento = await Agendamento.findById(req.params.id);
     
      if (!agendamento) {
        return res.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        });
      }

      res.json({
        success: true,
        agendamento
      });

    } catch (error) {
      console.error('❌ Erro ao buscar agendamento:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar agendamento'
      });
    }
  },

  // Buscar agendamentos por cliente
  // backend\src\controllers\agendamentoController.js

// Buscar agendamentos por cliente - VERSÃO CORRIGIDA
async findByCliente(req, res) {
  try {
    const cliente_id = req.params.cliente_id;
    
    // ✅ VALIDAÇÃO: Verificar se o cliente está tentando acessar seus próprios agendamentos
    const user = req.user; // Assumindo que você tem middleware de autenticação

    // ✅ MUDANÇA: Buscar apenas agendamentos do cliente específico
    const agendamentos = await Agendamento.findByClienteId(cliente_id);
   
    res.json({
      success: true,
      agendamentos,
      total: agendamentos.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos do cliente:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao buscar agendamentos'
    });
  }
},

// Listar todos os agendamentos (apenas para administração) - VERSÃO CORRIGIDA
async listAll(req, res) {
  try {

    const agendamentos = await Agendamento.findFuturos();
   
    res.json({
      success: true,
      agendamentos,
      total: agendamentos.length,
      message: agendamentos.length > 0
        ? `${agendamentos.length} agendamentos encontrados`
        : 'Nenhum agendamento encontrado'
    });

  } catch (error) {
    console.error('❌ Erro ao listar agendamentos:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao listar agendamentos'
    });
  }
},

  // Buscar agendamentos por prestador
  async findByPrestador(req, res) {
    try {
      // ✅ MUDANÇA: await em vez de Promise
      const agendamentos = await Agendamento.findByPrestadorId(req.params.prestador_id);
     
      res.json({
        success: true,
        agendamentos,
        total: agendamentos.length
      });

    } catch (error) {
      console.error('❌ Erro ao buscar agendamentos do prestador:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao buscar agendamentos'
      });
    }
  },

  // Atualizar status do agendamento
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status é obrigatório'
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const result = await Agendamento.updateStatus(id, status);
     
      if (result.updated === 0) {
        return res.status(404).json({
          success: false,
          error: 'Agendamento não encontrado'
        });
      }

      res.json({
        success: true,
        message: result.message,
        agendamento_id: id
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error.message);
     
      if (error.message.includes('Status inválido')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno ao atualizar status'
      });
    }
  },

  // Validar serviço (endpoint separado para validação)
  async validarServico(req, res) {
    try {
      const { servico_id } = req.params;

      if (!servico_id) {
        return res.status(400).json({
          success: false,
          error: 'servico_id é obrigatório'
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const servico = await Agendamento.validarServico(servico_id);
     
      res.json({
        success: true,
        servico,
        message: 'Serviço válido e disponível'
      });

    } catch (error) {
      console.error('❌ Erro ao validar serviço:', error.message);
     
      if (error.message.includes('Serviço não encontrado')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno ao validar serviço'
      });
    }
  },

  // Verificar disponibilidade do prestador
  async verificarDisponibilidade(req, res) {
    try {
      const { prestador_id, data_agendamento, duracao_minutos } = req.body;

      if (!prestador_id || !data_agendamento) {
        return res.status(400).json({
          success: false,
          error: 'prestador_id e data_agendamento são obrigatórios'
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const disponibilidade = await Agendamento.verificarDisponibilidade(
        prestador_id,
        data_agendamento,
        duracao_minutos || 60
      );

      res.json({
        success: true,
        disponivel: disponibilidade.disponivel,
        message: disponibilidade.disponivel
          ? 'Horário disponível para agendamento'
          : 'Horário indisponível'
      });

    } catch (error) {
      console.error('❌ Erro ao verificar disponibilidade:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao verificar disponibilidade'
      });
    }
  },

  // backend\src\controllers\agendamentoController.js

// Cancelar agendamento - VERSÃO CORRIGIDA
async cancelar(req, res) {
  try {
    const { id } = req.params;
    const { cliente_id } = req.body;

    if (!cliente_id) {
      return res.status(400).json({
        success: false,
        error: 'cliente_id é obrigatório'
      });
    }

    // ✅ MUDANÇA: Usar updateStatus em vez de delete
    const result = await Agendamento.updateStatus(id, 'cancelado');

    if (result.updated === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado ou você não tem permissão para cancelá-lo'
      });
    }

    res.json({
      success: true,
      message: 'Agendamento cancelado com sucesso!',
      agendamento_id: id
    });

  } catch (error) {
    console.error('❌ Erro ao cancelar agendamento:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno ao cancelar agendamento: ' + error.message
    });
  }
},
  // Listar todos os agendamentos (apenas para administração)
  async listAll(req, res) {
    try {
      // ✅ MUDANÇA: Implementação real
      const agendamentos = await Agendamento.findFuturos();
     
      res.json({
        success: true,
        agendamentos,
        total: agendamentos.length,
        message: agendamentos.length > 0 
          ? `${agendamentos.length} agendamentos encontrados` 
          : 'Nenhum agendamento encontrado'
      });

    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao listar agendamentos'
      });
    }
  }
};

module.exports = agendamentoController;