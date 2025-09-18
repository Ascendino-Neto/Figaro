const Cliente = require('../models/clienteModel');

const clienteController = {
  async create(req, res) {
    try {
      const cliente = await Cliente.create(req.body);
      res.status(201).json({ 
        success: true,
        message: "Cliente cadastrado com sucesso!", 
        cliente 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  async findByCpf(req, res) {
    try {
      const cliente = await Cliente.findByCpf(req.params.cpf);
      if (!cliente) {
        return res.status(404).json({ 
          success: false,
          error: "Cliente não encontrado" 
        });
      }
      res.json({ 
        success: true,
        cliente 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

module.exports = clienteController;