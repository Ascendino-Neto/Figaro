const db = require('../config/db');

// Não importar authMetricsUtils - vamos criar um mock vazio
const authMetrics = {
  recordLoginAttempt: (loginData) => {
    console.log('📊 Mock metrics - login attempt:', loginData.email);
    return { isRobust: false, robustnessScore: 0 };
  },
  getRobustnessCriteria: () => {
    return {};
  }
};

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('🔐 Tentativa de login:', email);

      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: "E-mail e senha são obrigatórios"
        });
      }

      // Buscar usuário
      const userQuery = `
        SELECT 
          u.id as usuario_id,
          u.email,
          u.senha, 
          u.tipo,
          u.cliente_id,
          u.prestador_id,
          c.id as cliente_real_id,
          c.nome as cliente_nome,
          p.nome as prestador_nome
        FROM usuarios u 
        LEFT JOIN clientes c ON u.cliente_id = c.id 
        LEFT JOIN prestadores p ON u.prestador_id = p.id 
        WHERE u.email = $1
      `;

      const user = await db.get(userQuery, [email]);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado"
        });
      }

      if (user.senha !== senha) {
        return res.status(401).json({
          success: false,
          error: "Senha incorreta"
        });
      }

      console.log('✅ Login bem-sucedido. Tipo:', user.tipo);

      // Estrutura de resposta
      let userResponse = {
        email: user.email,
        tipo: user.tipo
      };

      if (user.tipo === 'cliente') {
        userResponse.id = user.cliente_id || user.usuario_id;
        userResponse.nome = user.cliente_nome || user.email;
        userResponse.cliente_id = user.cliente_id;
      } 
      else if (user.tipo === 'prestador') {
        userResponse.id = user.prestador_id || user.usuario_id;
        userResponse.nome = user.prestador_nome || user.email;
        userResponse.prestador_id = user.prestador_id;
      } 
      else if (user.tipo === 'admin') {
        userResponse.id = user.usuario_id;
        userResponse.nome = 'Administrador';
      }

      res.json({
        success: true,
        message: "Login realizado com sucesso!",
        user: userResponse,
        token: "token_jwt_" + Date.now()
      });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({
        success: false,
        error: "Erro interno no servidor: " + error.message
      });
    }
  }
};

module.exports = authController;