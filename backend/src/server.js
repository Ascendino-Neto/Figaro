const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ? MUDAN�A: Importar database PostgreSQL
const db = require('./config/db');

// Importar TODAS as rotas
const clienteRoutes = require('./routes/clienteRoutes');
const clienteLoginRoutes = require('./routes/clienteLoginRoutes');
const prestadorRoutes = require('./routes/prestadorRoutes');
const prestadorLoginRoutes = require('./routes/prestadorLoginRoutes');
const authRoutes = require('./routes/authRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');

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
app.use('/api', authRoutes);
app.use('/api', servicoRoutes);
app.use('/api', agendamentoRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'API FigaroSchedule funcionando!',
    database: 'PostgreSQL', // ? MUDAN�A
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
      servicos: {
        cadastro: 'POST /api/servicos',
        listar: 'GET /api/servicos',
        buscarPorId: 'GET /api/servicos/:id',
        atualizar: 'PUT /api/servicos/:id',
        excluir: 'DELETE /api/servicos/:id'
      },
      agendamentos: {
        criar: 'POST /api/agendamentos',
        horariosDisponiveis: 'GET /api/agendamentos/horarios-disponiveis',
        buscarPorId: 'GET /api/agendamentos/:id',
        buscarPorCliente: 'GET /api/agendamentos/cliente/:cliente_id',
        buscarPorPrestador: 'GET /api/agendamentos/prestador/:prestador_id',
        atualizarStatus: 'PUT /api/agendamentos/:id/status',
        cancelar: 'DELETE /api/agendamentos/:id/cancelar'
      },
      auth: {
        login: 'POST /api/auth/login'
      },
      health: 'GET /api/health'
    }
  });
});

// Rota de sa�de (ATUALIZADA para PostgreSQL)
app.get('/api/health', async (req, res) => {
  try {
    // ? MUDAN�A: Teste de conex�o com PostgreSQL
    const result = await db.query('SELECT NOW() as time, version() as version');
    
    // Verificar tabelas
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    res.json({
      status: 'ok',
      database: 'PostgreSQL', // ? MUDAN�A
      timestamp: result.rows[0].time,
      version: result.rows[0].version.split(',')[0],
      tables: tables,
      environment: process.env.NODE_ENV || 'development'
    });
    
  } catch (error) {
    console.error('? Erro no health check:', error);
    res.status(500).json({
      status: 'error',
      database: 'PostgreSQL - offline',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Rota de fallback para endpoints n�o encontrados
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint n�o encontrado',
    message: `A rota ${req.originalUrl} n�o existe`,
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
      servicos: {
        cadastro: 'POST /api/servicos',
        listar: 'GET /api/servicos',
        buscarPorId: 'GET /api/servicos/:id'
      },
      agendamentos: {
        criar: 'POST /api/agendamentos',
        horariosDisponiveis: 'GET /api/agendamentos/horarios-disponiveis'
      },
      auth: {
        login: 'POST /api/auth/login'
      },
      health: 'GET /api/health',
      root: 'GET /'
    }
  });
});

// Manipulador de erros global
app.use((error, req, res, next) => {
  console.error('? Erro n�o tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Testar conex�o com PostgreSQL antes de iniciar
async function iniciarServidor() {
  try {
    console.log('?? Testando conex�o com PostgreSQL...');
    
    // Testar conex�o
    const result = await db.query('SELECT NOW() as current_time');
    console.log('? Conectado ao PostgreSQL - Figaro Schedule');
    console.log('   ?? Hora do servidor:', result.rows[0].current_time);
    
    // Verificar tabelas
    const tablesResult = await db.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('   ?? Tabelas no database:', tablesResult.rows[0].table_count);
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`?? Servidor rodando na porta ${PORT}`);
      console.log(`?? Acesse: http://localhost:${PORT}`);
      console.log('?? Endpoints dispon�veis:');
      console.log('   POST /api/clientes          - Cadastrar cliente');
      console.log('   GET  /api/clientes/:cpf     - Buscar cliente por CPF');
      console.log('   POST /api/prestadores       - Cadastrar prestador');
      console.log('   GET  /api/prestadores       - Listar prestadores');
      console.log('   POST /api/servicos          - Cadastrar servi�o');
      console.log('   GET  /api/servicos          - Listar servi�os');
      console.log('   POST /api/agendamentos      - Criar agendamento');
      console.log('   GET  /api/agendamentos/horarios-disponiveis - Hor�rios dispon�veis');
      console.log('   POST /api/auth/login        - Login');
      console.log('   GET  /api/health            - Status do sistema');
      console.log('   GET  /                      - Informa��es da API');
    });
    
  } catch (error) {
    console.error('? ERRO CR�TICO: N�o foi poss�vel conectar ao PostgreSQL');
    console.error('   Detalhes:', error.message);
    console.log('\n?? Solu��o:');
    console.log('   1. Verifique se o PostgreSQL est� rodando');
    console.log('   2. Confirme as credenciais no arquivo .env');
    console.log('   3. Verifique se o database "figaro_schedule" existe');
    console.log('   4. Execute o script SQL de cria��o das tabelas');
    process.exit(1);
  }
}

// Iniciar servidor
iniciarServidor();