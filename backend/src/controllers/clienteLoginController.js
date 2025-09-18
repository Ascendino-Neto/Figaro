const ClienteLogin = require('../models/clienteLoginModel');

const clienteLoginController = {
  async create(req, res) {
    try {
      const login = await ClienteLogin.create(req.body);
      res.status(201).json({ message: "Login do cliente criado!", login });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async findByEmail(req, res) {
    try {
      const user = await ClienteLogin.findByEmail(req.params.email);
      if (!user) return res.status(404).json({ error: "Usu�rio n�o encontrado" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = clienteLoginController;
