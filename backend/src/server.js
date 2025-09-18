const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar database SQLite
const db = require('./config/db');

// Importar TODAS as rotas
const clienteRoutes = require('./routes/clienteRoutes');
const clienteLoginRoutes = require('./routes/clienteLoginRoutes');
const prestadorRoutes = require('./routes/prestadorRoutes');
const prestadorLoginRoutes = require('./routes/prestadorLoginRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registrar TODAS as rotas com prefixo /api
app.use('/api', clienteRoutes);
app.use('/api', clienteLoginRoutes);
app.use('/api', prestadorRoutes);
app.use('/api', prestadorLoginRoutes);

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
        login: 'POST /api/clientes/login',
        buscarEmail: 'GET /api/clientes/login/:email'
      },
      prestadores: {
        cadastro: 'POST /api/prestadores',
        listar: 'GET /api/prestadores',
        login: 'POST /api/prestadores/login',
        buscarEmail: 'GET /api/prestadores/login/:email'
      },
      health: 'GET /health'
    }
  });
});

// Rota de sa�de
app.get('/api/health', (req, res) => {
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
        tables: ['clientes', 'usuarios', 'agendamentos', 'prestadores']
      });
    }
  });
});

// Rota de fallback para endpoints não encontrados
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
      prestadores: {
        cadastro: 'POST /api/prestadores',
        listar: 'GET /api/prestadores',
        login: 'POST /api/prestadores/login',
        buscarEmail: 'GET /api/prestadores/login/:email'
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
  console.log('🚀 Servidor rodando na porta ${PORT}');
  console.log('📊 SQLite conectado: ./figaro.db');
  console.log('🌐 Acesse: http://localhost:${PORT}');
  console.log('📋 Endpoints disponíveis:');
  console.log('   POST /api/clientes          - Cadastrar cliente');
  console.log('   GET  /api/clientes/:cpf     - Buscar cliente por CPF');
  console.log('   POST /api/clientes/login    - Criar login cliente');
  console.log('   POST /api/prestadores       - Cadastrar prestador');
  console.log('   GET  /api/prestadores       - Listar prestadores');
  console.log('   POST /api/prestadores/login - Criar login prestador');
  console.log('   GET  /health               - Status do servidor');
  console.log('   GET  /                     - Informações da API');
});