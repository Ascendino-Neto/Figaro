const Cliente = require('../models/clienteModel');
const ClienteLogin = require('../models/clienteLoginModel');

const clienteController = {
  async create(req, res) {
    try {
      console.log('📝 Cadastrando cliente:', req.body);
     
      const { nome, cpf, telefone, email, senha } = req.body;

      // 1. Primeiro cadastra o CLIENTE
      const clienteData = { nome, cpf, telefone, email };
      const cliente = await Cliente.create(clienteData);
     
      console.log('✅ Cliente salvo:', cliente);

      // 2. Depois cadastra o LOGIN COMO CLIENTE
      try {
        const loginData = {
          email,
          senha,
          telefone,
          cliente_id: cliente.id
        };
        const login = await ClienteLogin.create(loginData);
       
        console.log('✅ Login salvo:', login);

        res.status(201).json({
          success: true,
          message: "Cliente cadastrado com sucesso!",
          cliente,
          login
        });

      } catch (loginError) {
        console.error('❌ Erro ao criar login:', loginError);
       
        // Compensação: remove o cliente se o login falhar
        try {
          await Cliente.deleteByEmail(email);
          console.log('🔄 Cliente removido devido a erro no login');
        } catch (deleteError) {
          console.error('❌ Erro ao remover cliente:', deleteError);
        }

        throw new Error("Erro ao criar login: " + loginError.message);
      }
     
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  async findByCpf(req, res) {
    try {
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
      console.error('❌ Erro ao buscar cliente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ ADICIONE ESTE MÉTODO (que estava faltando)
  async findByEmail(req, res) {
    try {
      const cliente = await Cliente.findByEmail(req.params.email);
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
      console.error('❌ Erro ao buscar cliente por email:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // ✅ ADICIONE ESTES MÉTODOS TAMBÉM
  async findById(req, res) {
    try {
      const cliente = await Cliente.findById(req.params.id);
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
      console.error('❌ Erro ao buscar cliente por ID:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async listAll(req, res) {
    try {
      const clientes = await Cliente.findAll();
      res.json({
        success: true,
        clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar clientes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone, email } = req.body;

      // Implementação básica - ajuste conforme seu model
      const clienteAtualizado = await Cliente.update(id, { nome, telefone, email });
      
      res.json({
        success: true,
        message: "Cliente atualizado com sucesso!",
        cliente: clienteAtualizado
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Cliente.delete(id);
      
      if (result.deleted === 0) {
        return res.status(404).json({
          success: false,
          error: "Cliente não encontrado"
        });
      }

      res.json({
        success: true,
        message: "Cliente excluído com sucesso"
      });
    } catch (error) {
      console.error('❌ Erro ao excluir cliente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = clienteController;