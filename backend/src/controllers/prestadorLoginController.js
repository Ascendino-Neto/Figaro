const PrestadorLogin = require('../models/prestadorLoginModel');

const prestadorLoginController = {
  async create(req, res) {
    try {
      const login = await PrestadorLogin.create(req.body);
      res.status(201).json({ message: "Login do prestador criado!", login });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async findByEmail(req, res) {
    try {
      const user = await PrestadorLogin.findByEmail(req.params.email);
      if (!user) return res.status(404).json({ error: "Prestador não encontrado" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = prestadorLoginController;
