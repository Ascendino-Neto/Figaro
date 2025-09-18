const ClienteLogin = require('../models/clienteLoginModel');

const clienteLoginController = {
  async create(req, res) {
    try {
      const { email, senha } = req.body; // Agora só email e senha
      
      // Validação mínima
      if (!email || !senha) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }

      const login = await ClienteLogin.create({ email, senha });
      res.status(201).json({ 
        message: "Login do cliente criado!", 
        login,
        token: "token_simulado_" + Date.now() // Em produção, use JWT real
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async findByEmail(req, res) {
    try {
      const user = await ClienteLogin.findByEmail(req.params.email);
      if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = clienteLoginController;