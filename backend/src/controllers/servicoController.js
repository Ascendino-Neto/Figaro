const Servico = require('../models/servicoModel');

const servicoController = {
  async create(req, res) {
    try {
      console.log('📝 Cadastrando serviço:', req.body);
     
      const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao } = req.body;

      // Validações
      if (!nome || !local_atendimento) {
        return res.status(400).json({
          success: false,
          error: "Nome do serviço e local de atendimento são obrigatórios"
        });
      }

      // Obtém o ID do prestador logado (simulado por enquanto)
      const prestador_id = 1; // Em produção, viria do token JWT

      const servicoData = {
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor: valor || null,
        tempo_duracao: tempo_duracao || null,
        prestador_id
      };

      // ✅ MUDANÇA: await em vez de Promise
      const servico = await Servico.create(servicoData);
     
      console.log('✅ Serviço cadastrado:', servico);

      res.status(201).json({
        success: true,
        message: "Serviço cadastrado com sucesso!",
        servico
      });

    } catch (error) {
      console.error('❌ Erro ao cadastrar serviço:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  async getByPrestador(req, res) {
    try {
      // Obtém o ID do prestador logado (simulado por enquanto)
      const prestador_id = 1; // Em produção, viria do token JWT

      // ✅ MUDANÇA: await em vez de Promise
      const servicos = await Servico.findByPrestadorId(prestador_id);
     
      res.json({
        success: true,
        servicos
      });

    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async getAll(req, res) {
    try {
      // ✅ MUDANÇA: await em vez de Promise
      const servicos = await Servico.findAll();
     
      res.json({
        success: true,
        servicos,
        total: servicos.length,
        message: servicos.length > 0
          ? `${servicos.length} serviços encontrados`
          : 'Nenhum serviço cadastrado'
      });

    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
     
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID do serviço é obrigatório e deve ser um número"
        });
      }

      // ✅ MUDANÇA: await em vez de Promise
      const servico = await Servico.findById(id);
     
      if (!servico) {
        return res.status(404).json({
          success: false,
          error: "Serviço não encontrado"
        });
      }

      res.json({
        success: true,
        servico
      });

    } catch (error) {
      console.error('❌ Erro ao buscar serviço:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao } = req.body;

      console.log('📝 Atualizando serviço:', { id, ...req.body });

      // Validações
      if (!nome || !local_atendimento) {
        return res.status(400).json({
          success: false,
          error: "Nome do serviço e local de atendimento são obrigatórios"
        });
      }

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID do serviço é obrigatório"
        });
      }

      // Obtém o ID do prestador logado (simulado por enquanto)
      const prestador_id = 1; // Em produção, viria do token JWT

      const servicoData = {
        nome,
        descricao,
        local_atendimento,
        tecnicas_utilizadas,
        valor: valor || null,
        tempo_duracao: tempo_duracao || null
      };

      // ✅ MUDANÇA: await em vez de Promise
      const servicoAtualizado = await Servico.update(id, prestador_id, servicoData);
     
      console.log('✅ Serviço atualizado:', servicoAtualizado);

      res.json({
        success: true,
        message: "Serviço atualizado com sucesso!",
        servico: servicoAtualizado
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar serviço:', error);
     
      if (error.message.includes('não encontrado') || error.message.includes('permissão')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
     
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: "ID do serviço é obrigatório"
        });
      }

      const prestador_id = 1; // Em produção, viria do token JWT

      // ✅ MUDANÇA: await em vez de Promise
      const result = await Servico.delete(id, prestador_id);
     
      if (result.deleted === 0) {
        return res.status(404).json({
          success: false,
          error: "Serviço não encontrado ou você não tem permissão para excluí-lo"
        });
      }

      res.json({
        success: true,
        message: "Serviço excluído com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro ao excluir serviço:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ NOVO: Buscar serviços ativos (apenas serviços disponíveis)
  async getAtivos(req, res) {
    try {
      // ✅ MUDANÇA: await em vez de Promise
      const servicos = await Servico.findAtivos();
     
      res.json({
        success: true,
        servicos,
        total: servicos.length,
        message: servicos.length > 0
          ? `${servicos.length} serviços disponíveis`
          : 'Nenhum serviço disponível no momento'
      });

    } catch (error) {
      console.error('❌ Erro ao buscar serviços ativos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = servicoController;