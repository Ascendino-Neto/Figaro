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
      const servicos = await Servico.findAll();
      
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

  async delete(req, res) {
    try {
      const { id } = req.params;
      const prestador_id = 1; // Em produção, viria do token JWT

      const result = await Servico.delete(id, prestador_id);
      
      if (result.deleted === 0) {
        return res.status(404).json({
          success: false,
          error: "Serviço não encontrado"
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
  }
};

module.exports = servicoController;