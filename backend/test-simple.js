const http = require('http');

async function testRoutes() {
  console.log('🧪 Testando rotas da API (sem dependências)...\n');

  const baseURL = 'http://localhost:3000/api';

  // 1. Teste rota de serviços
  console.log('1. 📋 Testando GET /api/servicos...');
  await testGET(`${baseURL}/servicos`);

  // 2. Teste rota de prestadores
  console.log('\n2. 👥 Testando GET /api/prestadores...');
  await testGET(`${baseURL}/prestadores`);

  // 3. Teste health check
  console.log('\n3. 🔍 Testando GET /api/health...');
  await testGET(`${baseURL}/health`);

  console.log('\n🎉 Teste de rotas concluído!');
}

function testGET(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`   ✅ Status: ${res.statusCode}`);
          console.log(`   ✅ Success: ${jsonData.success !== undefined ? jsonData.success : 'N/A'}`);
          
          if (jsonData.servicos) {
            console.log(`   ✅ Total serviços: ${jsonData.servicos.length}`);
          }
          if (jsonData.prestadores) {
            console.log(`   ✅ Total prestadores: ${jsonData.prestadores.length}`);
          }
          if (jsonData.database) {
            console.log(`   ✅ Database: ${jsonData.database}`);
          }
        } catch (e) {
          console.log(`   ✅ Status: ${res.statusCode}`);
          console.log(`   📄 Response: ${data.substring(0, 100)}...`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`   ❌ Erro: ${err.message}`);
      console.log(`   💡 Verifique se o servidor está rodando na porta 3000`);
      resolve();
    });
  });
}

// Executar teste
testRoutes();