const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar database SQLite
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API FigaroSchedule funcionando!',
    database: 'SQLite',
    status: 'online'
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
        timestamp: row.time 
      });
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`?? Servidor rodando na porta ${PORT}`);
  console.log(`?? SQLite conectado: ./figaro.db`);
  console.log(`?? Acesse: http://localhost:${PORT}`);
});