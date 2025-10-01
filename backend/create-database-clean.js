#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configurações
const DB_PATH = path.join(__dirname, 'figaro.db');
const BACKUP_DIR = path.join(__dirname, 'backups');

console.log('🗄️  FIGARO SCHEDULE - CRIADOR DE BANCO DE DADOS LIMPO');
console.log('====================================================\n');

// Função para criar backup do banco existente
function createBackup() {
  if (fs.existsSync(DB_PATH)) {
    console.log('📦 Criando backup do banco existente...');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }
    
    const backupName = `figaro_backup_${Date.now()}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    try {
      fs.copyFileSync(DB_PATH, backupPath);
      console.log(`✅ Backup criado: ${backupName}`);
    } catch (error) {
      console.log('⚠️  Não foi possível criar backup:', error.message);
    }
  }
}

// Função principal para criar o banco
function createDatabase() {
  console.log('🚀 Iniciando criação do banco de dados...\n');
  
  // Criar backup primeiro
  createBackup();
  
  // Conectar/Criar banco de dados
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Erro ao conectar com o banco:', err.message);
      process.exit(1);
    }
    console.log('✅ Conectado ao banco SQLite.');
  });

  // Executar todas as queries em série
  db.serialize(() => {
    console.log('\n🗑️  Removendo tabelas existentes...');
    
    // Remover tabelas na ordem correta (devido às FKs)
    const dropTables = [
      'DROP TABLE IF EXISTS agendamentos',
      'DROP TABLE IF EXISTS servicos', 
      'DROP TABLE IF EXISTS usuarios',
      'DROP TABLE IF EXISTS prestadores',
      'DROP TABLE IF EXISTS clientes'
    ];
    
    dropTables.forEach((sql, index) => {
      db.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erro ao remover tabela ${index + 1}:`, err.message);
        } else {
          console.log(`✅ Tabela ${index + 1} removida`);
        }
      });
    });

    // Aguardar um pouco antes de criar as novas tabelas
    setTimeout(() => {
      console.log('\n🏗️  Criando novas tabelas...');
      
      // =============================================
      // TABELA: clientes
      // =============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS clientes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT UNIQUE NOT NULL,
          telefone TEXT,
          email TEXT UNIQUE,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela clientes:', err.message);
        } else {
          console.log('✅ Tabela clientes criada');
        }
      });

      // =============================================
      // TABELA: prestadores  
      // =============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS prestadores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          cpf TEXT UNIQUE NOT NULL,
          endereco TEXT NOT NULL,
          telefone TEXT NOT NULL,
          cep TEXT NOT NULL,
          email TEXT UNIQUE,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela prestadores:', err.message);
        } else {
          console.log('✅ Tabela prestadores criada');
        }
      });

      // =============================================
      // TABELA: usuarios (Sistema de login unificado)
      // =============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id INTEGER,
          prestador_id INTEGER,
          email TEXT UNIQUE NOT NULL,
          senha TEXT NOT NULL,
          telefone TEXT,
          tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'prestador', 'admin')),
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          ultimo_login DATETIME,
          FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE CASCADE,
          FOREIGN KEY (prestador_id) REFERENCES prestadores (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela usuarios:', err.message);
        } else {
          console.log('✅ Tabela usuarios criada');
        }
      });

      // =============================================
      // TABELA: servicos
      // =============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS servicos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prestador_id INTEGER NOT NULL,
          nome TEXT NOT NULL,
          descricao TEXT,
          local_atendimento TEXT NOT NULL,
          tecnicas_utilizadas TEXT,
          valor DECIMAL(10,2),
          tempo_duracao INTEGER,
          ativo BOOLEAN DEFAULT 1,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prestador_id) REFERENCES prestadores (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela servicos:', err.message);
        } else {
          console.log('✅ Tabela servicos criada');
        }
      });

      // =============================================
      // TABELA: agendamentos
      // =============================================
      db.run(`
        CREATE TABLE IF NOT EXISTS agendamentos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cliente_id INTEGER NOT NULL,
          prestador_id INTEGER NOT NULL,
          servico_id INTEGER NOT NULL,
          data_agendamento DATETIME NOT NULL,
          data_fim_previsto DATETIME,
          status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'ausente')),
          valor_servico DECIMAL(10,2),
          observacoes TEXT,
          avaliacao INTEGER CHECK (avaliacao >= 1 AND avaliacao <= 5),
          comentario_avaliacao TEXT,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (cliente_id) REFERENCES clientes (id),
          FOREIGN KEY (prestador_id) REFERENCES prestadores (id),
          FOREIGN KEY (servico_id) REFERENCES servicos (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Erro ao criar tabela agendamentos:', err.message);
        } else {
          console.log('✅ Tabela agendamentos criada');
        }
      });

      // Aguardar criação das tabelas antes de criar índices
      setTimeout(() => {
        console.log('\n📊 Criando índices para performance...');
        
        const indexes = [
          // Clientes
          'CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)',
          'CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes(cpf)',
          
          // Prestadores
          'CREATE INDEX IF NOT EXISTS idx_prestadores_email ON prestadores(email)',
          'CREATE INDEX IF NOT EXISTS idx_prestadores_cpf ON prestadores(cpf)',
          'CREATE INDEX IF NOT EXISTS idx_prestadores_ativo ON prestadores(ativo)',
          
          // Usuários
          'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)',
          'CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo)',
          'CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo)',
          'CREATE INDEX IF NOT EXISTS idx_usuarios_cliente_id ON usuarios(cliente_id)',
          'CREATE INDEX IF NOT EXISTS idx_usuarios_prestador_id ON usuarios(prestador_id)',
          'CREATE INDEX IF NOT EXISTS idx_usuarios_telefone ON usuarios(telefone)',
          
          // Serviços
          'CREATE INDEX IF NOT EXISTS idx_servicos_prestador_id ON servicos(prestador_id)',
          'CREATE INDEX IF NOT EXISTS idx_servicos_ativo ON servicos(ativo)',
          
          // Agendamentos
          'CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_id ON agendamentos(cliente_id)',
          'CREATE INDEX IF NOT EXISTS idx_agendamentos_prestador_id ON agendamentos(prestador_id)',
          'CREATE INDEX IF NOT EXISTS idx_agendamentos_servico_id ON agendamentos(servico_id)',
          'CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento)',
          'CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status)'
        ];
        
        let indexesCreated = 0;
        const totalIndexes = indexes.length;
        
        indexes.forEach((sql, index) => {
          db.run(sql, (err) => {
            if (err) {
              console.error(`❌ Erro ao criar índice ${index + 1}:`, err.message);
            } else {
              indexesCreated++;
              console.log(`✅ Índice ${index + 1}/${totalIndexes} criado`);
            }
            
            // Quando todos os índices forem criados, finalizar
            if (indexesCreated === totalIndexes) {
              finalizeDatabase();
            }
          });
        });
      }, 1000);
    }, 500);
  });

  function finalizeDatabase() {
    console.log('\n🔍 Verificando estrutura final do banco...');
    
    // Verificar estrutura da tabela usuarios
    db.all("PRAGMA table_info(usuarios)", (err, columns) => {
      if (err) {
        console.error('❌ Erro ao verificar estrutura da tabela usuarios:', err.message);
      } else {
        console.log('\n📋 ESTRUTURA DA TABELA USUARIOS:');
        columns.forEach(col => {
          console.log(`   ${col.name} (${col.type})`);
        });
      }
      
      // Verificar todas as tabelas criadas
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          console.error('❌ Erro ao verificar tabelas:', err.message);
        } else {
          console.log('\n📋 TODAS AS TABELAS CRIADAS:');
          tables.forEach(table => {
            console.log(`   📁 ${table.name}`);
          });
          
          console.log(`\n🎉 BANCO DE DADOS CRIADO COM SUCESSO!`);
          console.log(`📍 Local: ${DB_PATH}`);
          console.log(`📊 Total de tabelas: ${tables.length}`);
          console.log(`🗃️  Total de índices: 20`);
        }
        
        // Verificar se não há dados (deve estar vazio)
        db.all("SELECT COUNT(*) as total FROM usuarios", (err, result) => {
          if (err) {
            console.error('❌ Erro ao verificar dados:', err.message);
          } else {
            console.log(`👤 Usuários no banco: ${result[0].total} (limpo)`);
          }
          
          // Fechar conexão
          db.close((err) => {
            if (err) {
              console.error('❌ Erro ao fechar banco:', err.message);
            } else {
              console.log('🔒 Conexão com o banco fechada.');
            }
            
            console.log('\n✨ Processo finalizado!');
            console.log('💡 Dica: Agora execute "npm start" e cadastre seus usuários.');
            console.log('📝 O banco está completamente limpo e pronto para uso.');
          });
        });
      });
    });
  }
}

// Executar criação do banco
createDatabase();