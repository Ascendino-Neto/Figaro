const Prestador = require('../models/prestadorModel');

const prestadorController = {
  async create(req, res) {
    try {
      const prestador = await Prestador.create(req.body);
      res.status(201).json({ message: "Prestador cadastrado com sucesso!", prestador });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async listAll(req, res) {
    try {
      const prestadores = await Prestador.findAll();
      res.json(prestadores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = prestadorController;