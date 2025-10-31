const cryptoService = require('../utils/cryptoUtils');

const encryptionMiddleware = {
  // Middleware para criptografar dados antes de salvar
  encryptSensitiveData: (entityType) => {
    return (req, res, next) => {
      try {
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`🔐 Criptografando dados para: ${entityType}`);
          
          const encryptionResult = cryptoService.encryptSensitiveData(req.body, entityType);
          
          // Substituir body pelos dados criptografados
          req.body = encryptionResult.data;
          
          // Adicionar estatísticas para logging
          req.encryptionStats = encryptionResult.stats;
          
          console.log(`✅ Criptografia: ${encryptionResult.stats.encrypted}/${encryptionResult.stats.total} campos (${encryptionResult.stats.rate}%)`);
        }
        
        next();
      } catch (error) {
        console.error('❌ Erro no middleware de criptografia:', error);
        next(error);
      }
    };
  },

  // Middleware para descriptografar dados ao buscar
  decryptSensitiveData: (entityType) => {
    return (req, res, next) => {
      try {
        const originalSend = res.send;
        
        res.send = function(data) {
          try {
            if (typeof data === 'string') {
              let parsedData;
              
              try {
                parsedData = JSON.parse(data);
              } catch {
                // Se não for JSON, enviar original
                return originalSend.call(this, data);
              }
              
              if (parsedData.success) {
                // Descriptografar array de dados
                if (Array.isArray(parsedData.data)) {
                  parsedData.data = parsedData.data.map(item => 
                    cryptoService.decryptSensitiveData(item, entityType)
                  );
                } 
                // Descriptografar objeto único
                else if (parsedData.data && typeof parsedData.data === 'object') {
                  parsedData.data = cryptoService.decryptSensitiveData(parsedData.data, entityType);
                }
                
                data = JSON.stringify(parsedData);
              }
            }
          } catch (error) {
            console.error('❌ Erro ao descriptografar resposta:', error);
          }
          
          originalSend.call(this, data);
        };
        
        next();
      } catch (error) {
        console.error('❌ Erro no middleware de descriptografia:', error);
        next(error);
      }
    };
  }
};

module.exports = encryptionMiddleware;