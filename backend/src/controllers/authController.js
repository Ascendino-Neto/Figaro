const db = require('../config/db'); // ? IMPORTE O DB DIRETAMENTE

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('?? Tentativa de login:', email); // Debug

      // Valida��es b�sicas
      if (!email || !senha) {
        return res.status(400).json({ 
          success: false,
          error: "E-mail e senha s�o obrigat�rios" 
        });
      }

      // ? CORRE��O: Busca o usu�rio na tabela usuarios (n�o apenas no ClienteLogin)
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      console.log('?? Usu�rio encontrado:', user); // Debug

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

      console.log('? Login bem-sucedido. Tipo:', user.tipo); // Debug

      // ? CORRE��O: Retorna o tipo REAL do usu�rio do banco
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