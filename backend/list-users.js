#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Configuração do banco de dados
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'figaro_schedule',
  password: process.env.DB_PASSWORD || 'sua_senha',
  port: process.env.DB_PORT || 5432,
});

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Função para formatar data
function formatDate(dateString) {
  return new Date(dateString).toLocaleString('pt-BR');
}

// Função para mostrar cabeçalho
function showHeader(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
}

// Função para listar todos os usuários
async function listAllUsers() {
  showHeader('👥 TODOS OS USUÁRIOS DO SISTEMA');

  try {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.tipo,
        u.telefone,
        u.ativo,
        u.criado_em,
        u.atualizado_em,
        c.id as cliente_id,
        c.nome as cliente_nome,
        p.id as prestador_id,
        p.nome as prestador_nome
      FROM usuarios u
      LEFT JOIN clientes c ON u.cliente_id = c.id
      LEFT JOIN prestadores p ON u.prestador_id = p.id
      ORDER BY u.criado_em DESC
    `;

    const result = await pool.query(query);
    const usuarios = result.rows;

    if (usuarios.length === 0) {
      console.log(`${colors.yellow}Nenhum usuário encontrado no sistema.${colors.reset}`);
      return;
    }

    usuarios.forEach((user, index) => {
      const status = user.ativo ? `${colors.green}ATIVO${colors.reset}` : `${colors.red}INATIVO${colors.reset}`;
      const tipoColor = 
        user.tipo === 'admin' ? colors.red :
        user.tipo === 'prestador' ? colors.blue : colors.green;

      console.log(`\n${colors.bright}${index + 1}. ${user.email}${colors.reset}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Tipo: ${tipoColor}${user.tipo.toUpperCase()}${colors.reset}`);
      console.log(`   Status: ${status}`);
      console.log(`   Telefone: ${user.telefone || 'Não informado'}`);
      
      if (user.cliente_nome) {
        console.log(`   Cliente: ${colors.green}${user.cliente_nome} (ID: ${user.cliente_id})${colors.reset}`);
      }
      
      if (user.prestador_nome) {
        console.log(`   Prestador: ${colors.blue}${user.prestador_nome} (ID: ${user.prestador_id})${colors.reset}`);
      }
      
      console.log(`   Criado em: ${formatDate(user.criado_em)}`);
    });

    console.log(`\n${colors.bright}${colors.green}✅ Total: ${usuarios.length} usuários${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao listar usuários:${colors.reset}`, error.message);
  }
}

// Função para listar apenas clientes
async function listClientes() {
  showHeader('👤 CLIENTES CADASTRADOS');

  try {
    const query = `
      SELECT 
        c.*,
        u.email,
        u.ativo
      FROM clientes c
      LEFT JOIN usuarios u ON c.id = u.cliente_id
      ORDER BY c.nome
    `;

    const result = await pool.query(query);
    const clientes = result.rows;

    if (clientes.length === 0) {
      console.log(`${colors.yellow}Nenhum cliente encontrado.${colors.reset}`);
      return;
    }

    clientes.forEach((cliente, index) => {
      const status = cliente.ativo ? `${colors.green}ATIVO${colors.reset}` : `${colors.red}INATIVO${colors.reset}`;
      
      console.log(`\n${colors.bright}${index + 1}. ${cliente.nome}${colors.reset}`);
      console.log(`   ID: ${cliente.id}`);
      console.log(`   CPF: ${cliente.cpf}`);
      console.log(`   Email: ${cliente.email || 'Não vinculado'}`);
      console.log(`   Telefone: ${cliente.telefone}`);
      console.log(`   Status: ${status}`);
      console.log(`   Criado em: ${formatDate(cliente.criado_em)}`);
    });

    console.log(`\n${colors.bright}${colors.green}✅ Total: ${clientes.length} clientes${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao listar clientes:${colors.reset}`, error.message);
  }
}

// Função para listar apenas prestadores
async function listPrestadores() {
  showHeader('💼 PRESTADORES DE SERVIÇO');

  try {
    const query = `
      SELECT 
        p.*,
        u.email,
        u.ativo
      FROM prestadores p
      LEFT JOIN usuarios u ON p.id = u.prestador_id
      ORDER BY p.nome
    `;

    const result = await pool.query(query);
    const prestadores = result.rows;

    if (prestadores.length === 0) {
      console.log(`${colors.yellow}Nenhum prestador encontrado.${colors.reset}`);
      return;
    }

    prestadores.forEach((prestador, index) => {
      const status = prestador.ativo ? `${colors.green}ATIVO${colors.reset}` : `${colors.red}INATIVO${colors.reset}`;
      
      console.log(`\n${colors.bright}${index + 1}. ${prestador.nome}${colors.reset}`);
      console.log(`   ID: ${prestador.id}`);
      console.log(`   CPF: ${prestador.cpf}`);
      console.log(`   Email: ${prestador.email || 'Não vinculado'}`);
      console.log(`   Telefone: ${prestador.telefone}`);
      console.log(`   Endereço: ${prestador.endereco}`);
      console.log(`   CEP: ${prestador.cep}`);
      console.log(`   Status: ${status}`);
      console.log(`   Criado em: ${formatDate(prestador.criado_em)}`);
    });

    console.log(`\n${colors.bright}${colors.green}✅ Total: ${prestadores.length} prestadores${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao listar prestadores:${colors.reset}`, error.message);
  }
}

// Função para listar administradores
async function listAdmins() {
  showHeader('🔧 USUÁRIOS ADMINISTRADORES');

  try {
    const query = `
      SELECT *
      FROM usuarios 
      WHERE tipo = 'admin'
      ORDER BY criado_em DESC
    `;

    const result = await pool.query(query);
    const admins = result.rows;

    if (admins.length === 0) {
      console.log(`${colors.yellow}Nenhum administrador encontrado.${colors.reset}`);
      return;
    }

    admins.forEach((admin, index) => {
      const status = admin.ativo ? `${colors.green}ATIVO${colors.reset}` : `${colors.red}INATIVO${colors.reset}`;
      
      console.log(`\n${colors.bright}${index + 1}. ${admin.email}${colors.reset}`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Tipo: ${colors.red}ADMIN${colors.reset}`);
      console.log(`   Telefone: ${admin.telefone || 'Não informado'}`);
      console.log(`   Status: ${status}`);
      console.log(`   Criado em: ${formatDate(admin.criado_em)}`);
      console.log(`   Atualizado em: ${admin.atualizado_em ? formatDate(admin.atualizado_em) : 'Nunca'}`);
    });

    console.log(`\n${colors.bright}${colors.green}✅ Total: ${admins.length} administradores${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao listar administradores:${colors.reset}`, error.message);
  }
}

// Função para estatísticas gerais
async function showStatistics() {
  showHeader('📊 ESTATÍSTICAS DO SISTEMA');

  try {
    const queries = {
      totalUsuarios: 'SELECT COUNT(*) as count FROM usuarios',
      usuariosAtivos: 'SELECT COUNT(*) as count FROM usuarios WHERE ativo = true',
      clientes: 'SELECT COUNT(*) as count FROM clientes',
      prestadores: 'SELECT COUNT(*) as count FROM prestadores',
      admins: 'SELECT COUNT(*) as count FROM usuarios WHERE tipo = \'admin\'',
    };

    const results = {};

    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query);
      results[key] = parseInt(result.rows[0].count);
    }

    console.log(`${colors.bright}👥 Usuários Totais:${colors.reset} ${colors.cyan}${results.totalUsuarios}${colors.reset}`);
    console.log(`${colors.bright}✅ Usuários Ativos:${colors.reset} ${colors.green}${results.usuariosAtivos}${colors.reset}`);
    console.log(`${colors.bright}👤 Clientes:${colors.reset} ${colors.green}${results.clientes}${colors.reset}`);
    console.log(`${colors.bright}💼 Prestadores:${colors.reset} ${colors.blue}${results.prestadores}${colors.reset}`);
    console.log(`${colors.bright}🔧 Administradores:${colors.reset} ${colors.red}${results.admins}${colors.reset}`);

    const taxaAtivos = ((results.usuariosAtivos / results.totalUsuarios) * 100).toFixed(1);
    console.log(`${colors.bright}📈 Taxa de Usuários Ativos:${colors.reset} ${colors.cyan}${taxaAtivos}%${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Erro ao gerar estatísticas:${colors.reset}`, error.message);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log(`${colors.bright}${colors.magenta}🚀 SISTEMA FIGARO SCHEDULE - LISTAGEM DE USUÁRIOS${colors.reset}`);
  console.log(`${colors.bright}${colors.magenta}⏰ ${new Date().toLocaleString('pt-BR')}${colors.reset}`);

  try {
    switch (command) {
      case 'clientes':
        await listClientes();
        break;
      case 'prestadores':
        await listPrestadores();
        break;
      case 'admins':
        await listAdmins();
        break;
      case 'stats':
        await showStatistics();
        break;
      case 'all':
      default:
        await listAllUsers();
        await listClientes();
        await listPrestadores();
        await listAdmins();
        await showStatistics();
        break;
    }

  } catch (error) {
    console.error(`${colors.red}❌ Erro executando o script:${colors.reset}`, error);
  } finally {
    await pool.end();
    console.log(`\n${colors.bright}${colors.green}✨ Script finalizado!${colors.reset}`);
    process.exit(0);
  }
}

// Mensagem de ajuda
function showHelp() {
  showHeader('📖 AJUDA - COMANDOS DISPONÍVEIS');
  
  console.log(`${colors.bright}Uso:${colors.reset}`);
  console.log(`  node list-users.js ${colors.cyan}[comando]${colors.reset}`);
  console.log(`\n${colors.bright}Comandos:${colors.reset}`);
  console.log(`  ${colors.cyan}all${colors.reset}        - Lista todos os usuários, clientes, prestadores e admins`);
  console.log(`  ${colors.cyan}clientes${colors.reset}   - Lista apenas os clientes`);
  console.log(`  ${colors.cyan}prestadores${colors.reset} - Lista apenas os prestadores`);
  console.log(`  ${colors.cyan}admins${colors.reset}     - Lista apenas os administradores`);
  console.log(`  ${colors.cyan}stats${colors.reset}      - Mostra apenas estatísticas`);
  console.log(`  ${colors.cyan}help${colors.reset}       - Mostra esta ajuda`);
  console.log(`\n${colors.bright}Exemplos:${colors.reset}`);
  console.log(`  node list-users.js ${colors.cyan}all${colors.reset}`);
  console.log(`  node list-users.js ${colors.cyan}clientes${colors.reset}`);
  console.log(`  node list-users.js ${colors.cyan}stats${colors.reset}`);
}

// Verificar se precisa mostrar ajuda
if (process.argv.includes('--help') || process.argv.includes('-h') || process.argv.includes('help')) {
  showHelp();
  process.exit(0);
}

// Executar o script
main().catch(console.error);