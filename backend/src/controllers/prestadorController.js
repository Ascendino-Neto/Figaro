const Prestador = require('../models/prestadorModel');
const PrestadorLogin = require('../models/prestadorLoginModel');

const prestadorController = {
  async create(req, res) {
    try {
      console.log('📝 Cadastrando prestador:', req.body);
      
      const { nome, cpf, endereco, telefone, cep, email, senha } = req.body;

      // 1. Cadastra o prestador
      const prestadorData = { nome, cpf, endereco, telefone, cep, email };
      const prestador = await Prestador.create(prestadorData);
      
      console.log('✅ Prestador salvo:', prestador);

      // 2. Cadastra o login
      try {
        const loginData = { email, senha, telefone };
        const login = await PrestadorLogin.create(loginData);
        
        console.log('✅ Login do prestador salvo:', login);

        res.status(201).json({ 
          success: true,
          message: "Prestador cadastrado com sucesso!", 
          prestador,
          login 
        });

      } catch (loginError) {
        console.error('❌ Erro ao criar login:', loginError);
        
        // Compensação
        try {
          await Prestador.deleteByEmail(email);
          console.log('🗑️ Prestador removido devido a erro no login');
        } catch (deleteError) {
          console.error('❌ Erro ao remover prestador:', deleteError);
        }

        res.status(400).json({ 
          success: false,
          error: "Erro ao criar login: " + loginError.message 
        });
      }
      
    } catch (error) {
      console.error('❌ Erro no cadastro do prestador:', error);
      res.status(400).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  async listAll(req, res) {
    try {
      const prestadores = await Prestador.findAll();
      res.json({ 
        success: true,
        prestadores 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

// ✅ CORRETO: Exporta o objeto completo
module.exports = prestadorController;