const Cliente = require('../models/clienteModel');
const ClienteLogin = require('../models/clienteLoginModel');

const clienteController = {
  async create(req, res) {
    try {
      console.log('?? Dados recebidos:', req.body);
     
      const { nome, cpf, telefone, email, senha } = req.body;

      // 1. Primeiro cadastra o CLIENTE
      const clienteData = { nome, cpf, telefone, email };
      
      // ? MUDANÇA: await em vez de Promise
      const cliente = await Cliente.create(clienteData);
     
      console.log('? Cliente salvo:', cliente);

      // 2. Depois cadastra o LOGIN COMO CLIENTE
      try {
        const loginData = {
          email,
          senha,
          telefone,
          cliente_id: cliente.id
        };
        
        // ? MUDANÇA: await em vez de Promise
        const login = await ClienteLogin.create(loginData);
       
        console.log('? Login salvo:', login);

        res.status(201).json({
          success: true,
          message: "Cliente cadastrado com sucesso!",
          cliente,
          login
        });

      } catch (loginError) {
        console.error('? Erro ao criar login:', loginError);
       
        // Compensação: remove o cliente se o login falhar
        try {
          await Cliente.deleteByEmail(email);
          console.log('?? Cliente removido devido a erro no login');
        } catch (deleteError) {
          console.error('? Erro ao remover cliente:', deleteError);
        }

        throw new Error("Erro ao criar login: " + loginError.message);
      }
     
    } catch (error) {
      console.error('? Erro no cadastro:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  async findByCpf(req, res) {
    try {
      // ? MUDANÇA: await em vez de Promise
      const cliente = await Cliente.findByCpf(req.params.cpf);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          error: "Cliente não encontrado"
        });
      }
      
      res.json({
        success: true,
        cliente
      });
    } catch (error) {
      console.error('? Erro ao buscar cliente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = clienteController;