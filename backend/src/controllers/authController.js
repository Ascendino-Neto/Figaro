const db = require('../config/db'); // ? IMPORTE O DB DIRETAMENTE

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('?? Tentativa de login:', email); // Debug

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({ 
          success: false,
          error: "E-mail e senha são obrigatórios" 
        });
      }

      // ? CORREÇÃO: Busca o usuário na tabela usuarios (não apenas no ClienteLogin)
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log('?? Usuário encontrado:', user); // Debug

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

      console.log('? Login bem-sucedido. Tipo:', user.tipo); // Debug

      // ? CORREÇÃO: Retorna o tipo REAL do usuário do banco
      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        user: {
          id: user.id,
          email: user.email,
          tipo: user.tipo // ? AGORA RETORNA O TIPO REAL
        },
        token: "token_jwt_" + Date.now()
      });

    } catch (error) {
      console.error('? Erro no login:', error); // Debug
      res.status(500).json({ 
        success: false,
        error: "Erro interno no servidor: " + error.message 
      });
    }
  }
};

module.exports = authController;