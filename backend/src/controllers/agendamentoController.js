const Agendamento = require('../models/agendamentoModel');

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

      // Criar agendamento
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

      if (error.message.includes('FOREIGN KEY constraint failed')) {
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

  // Buscar agendamento por ID
  async findById(req, res) {
    try {
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
  async findByCliente(req, res) {
    try {
      const agendamentos = await Agendamento.findByClienteId(req.params.cliente_id);
      
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

  // Buscar agendamentos por prestador
  async findByPrestador(req, res) {
    try {
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

  // Cancelar agendamento
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

      const result = await Agendamento.delete(id, cliente_id);
      
      res.json({
        success: result.deleted > 0,
        message: result.message,
        agendamento_id: id
      });

    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error.message);
      res.status(500).json({
        success: false,
        error: 'Erro interno ao cancelar agendamento'
      });
    }
  },

  // Listar todos os agendamentos (apenas para administração)
  async listAll(req, res) {
    try {
      // Esta função precisaria ser implementada no model
      // Por enquanto retornamos um array vazio
      res.json({
        success: true,
        agendamentos: [],
        total: 0,
        message: 'Funcionalidade em desenvolvimento'
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