const db = require('../config/db');

const authController = {
  async authenticate(req, res) {
    try {
      const { email, senha } = req.body;

      console.log('🔐 Tentativa de login:', email);

      // Validações básicas
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          error: "E-mail e senha são obrigatórios"
        });
      }

      // ✅ BUSCA CORRETA com JOIN
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

      console.log('🔍 Usuário encontrado no banco:', user);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "Usuário não encontrado"
        });
      }

      // Verifica a senha
      if (user.senha !== senha) {
        return res.status(401).json({
          success: false,
          error: "Senha incorreta"
        });
      }

      console.log('✅ Login bem-sucedido. Tipo:', user.tipo);

      // ✅ CORREÇÃO CRÍTICA: Estrutura de resposta CORRETA
      let userResponse = {
        email: user.email,
        tipo: user.tipo
      };

      // ✅ PARA CLIENTES: usar cliente_id como ID
      if (user.tipo === 'cliente') {
        if (!user.cliente_id) {
          throw new Error("Usuário cliente sem cliente_id associado");
        }
        userResponse.id = user.cliente_id; // ← ID CORRETO para agendamentos
        userResponse.nome = user.cliente_nome || user.email;
        userResponse.cliente_id = user.cliente_id;
      }
      
      // ✅ PARA PRESTADORES: usar prestador_id como ID
      else if (user.tipo === 'prestador') {
        if (!user.prestador_id) {
          throw new Error("Usuário prestador sem prestador_id associado");
        }
        userResponse.id = user.prestador_id;
        userResponse.nome = user.prestador_nome || user.email;
        userResponse.prestador_id = user.prestador_id;
      }
      
      // ✅ PARA ADMIN: usar usuario_id como ID
      else if (user.tipo === 'admin') {
        userResponse.id = user.usuario_id;
        userResponse.nome = 'Administrador';
      }

      console.log('📤 Dados retornados para frontend:', userResponse);

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