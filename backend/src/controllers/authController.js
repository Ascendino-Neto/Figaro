const ClienteLogin = require('../models/clienteLoginModel');

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({ 
          success: false,
          error: "E-mail e senha são obrigatórios" 
        });
      }

      // 1. Busca o usuário pelo email
      const user = await ClienteLogin.findByEmail(email);
      // ? REMOVA A LINHA COM APENAS "x" QUE ESTÁ AQUI!

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: "Usuário não encontrado" 
        });
      }

      // 2. Verifica a senha (simples comparação por enquanto)
      if (user.senha !== senha) {
        return res.status(401).json({ 
          success: false,
          error: "Senha incorreta" 
        });
      }

      // 3. Login bem-sucedido
      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          email: user.email,
          tipo: 'cliente'
        },
        token: "token_jwt_" + Date.now() // Em produção, use JWT real
      });

    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Erro interno no servidor: " + error.message 
      });
    }
  }
};

module.exports = authController;

