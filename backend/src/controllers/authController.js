const ClienteLogin = require('../models/clienteLoginModel');

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      // Valida��es b�sicas
      if (!email || !senha) {
        return res.status(400).json({ 
          success: false,
          error: "E-mail e senha s�o obrigat�rios" 
        });
      }

      // 1. Busca o usu�rio pelo email
      const user = await ClienteLogin.findByEmail(email);
      // ? REMOVA A LINHA COM APENAS "x" QUE EST� AQUI!

      if (!user) {
        return res.status(404).json({ 
          success: false,
          error: "Usu�rio n�o encontrado" 
        });
      }

      // 2. Verifica a senha (simples compara��o por enquanto)
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
        token: "token_jwt_" + Date.now() // Em produ��o, use JWT real
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

