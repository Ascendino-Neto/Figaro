const User = require('../models/userModel');

const userController = {
  // Criar usu�rio
  async create(req, res) {
    try {
      const user = await User.create(req.body);
      res.status(201).json({ message: 'Usu�rio criado!', user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Listar todos os usu�rios
  async listAll(req, res) {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Buscar usu�rio por email
  async findByEmail(req, res) {
    try {
      const user = await User.findByEmail(req.params.email);
      if (!user) {
        return res.status(404).json({ error: 'Usu�rio n�o encontrado' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;