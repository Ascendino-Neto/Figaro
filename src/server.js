const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar database SQLite
const db = require('./config/db');

// Importar TODAS as rotas
const userRoutes = require('./routes/userRoutes');
const clienteRoutes = require('./routes/clienteRoutes'); // NOVA rota (US 1)
const clienteLoginRoutes = require('./routes/clienteLoginRoutes'); // Rota EXISTENTE (US 2)

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registrar TODAS as rotas
app.use('/api', userRoutes);
app.use('/api', clienteRoutes); // Cadastro de clientes (US 1)
app.use('/api', clienteLoginRoutes); // Login de clientes (US 2)

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FigaroSchedule funcionando!',
    database: 'SQLite',
    status: 'online',
    endpoints: {
      clientes: {
        cadastro: 'POST /api/clientes',
        buscar: 'GET /api/clientes/:cpf',
        login: 'POST /api/clientes/login'
      },
      health: 'GET /health'
    }
  });
});

// Rota de saúde
app.get('/health', (req, res) => {
  db.get("SELECT datetime('now') as time", (err, row) => {
    if (err) {
      res.status(500).json({ 
        status: 'error', 
        database: 'offline',
        error: err.message 
      });
    } else {
      res.json({ 
        status: 'ok', 
        database: 'online',
        timestamp: row.time,
        tables: ['clientes', 'usuarios', 'agendamentos']
      });
    }
  });
});

// Rota de fallback para endpoints não encontrados (CORRIGIDO)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    message: `A rota ${req.originalUrl} não existe`,
    availableEndpoints: {
      clientes: {
        cadastro: 'POST /api/clientes',
        buscar: 'GET /api/clientes/:cpf',
        login: 'POST /api/clientes/login',
        buscarEmail: 'GET /api/clientes/login/:email'
      },
      health: 'GET /health',
      root: 'GET /'
    }
  });
});

// Manipulador de erros global
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`?? Servidor rodando na porta ${PORT}`);
  console.log(`?? SQLite conectado: ./figaro.db`);
  console.log(`?? Acesse: http://localhost:${PORT}`);
  console.log(`?? Endpoints disponíveis:`);
  console.log(`   POST /api/clientes          - Cadastrar cliente (US 1)`);
  console.log(`   GET  /api/clientes/:cpf     - Buscar cliente por CPF`);
  console.log(`   POST /api/clientes/login    - Criar login (US 2)`);
  console.log(`   GET  /health               - Status do servidor`);
  console.log(`   GET  /                     - Informações da API`);
});