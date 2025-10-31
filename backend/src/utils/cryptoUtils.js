const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || 'figaro-schedule-secret-key-2024';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;

// Definição de dados sensíveis que DEVEM ser criptografados
const SENSITIVE_FIELDS = {
  CLIENTE: ['cpf', 'telefone', 'email'],
  PRESTADOR: ['cpf', 'telefone', 'email', 'endereco'],
  AGENDAMENTO: ['observacoes', 'cliente_telefone', 'cliente_email'],
  USUARIO: ['senha', 'telefone']
};

class EncryptionMetrics {
  constructor() {
    this.metrics = {
      encryptedCount: 0,      // DC
      totalSensitive: 0,      // DT  
      encryptionRate: 0,      // x
      lastUpdated: new Date(),
      history: []
    };
  }

  // Registrar uma operação de criptografia
  recordEncryption(wasEncrypted, fieldType, entityType) {
    this.metrics.totalSensitive++;
    
    if (wasEncrypted) {
      this.metrics.encryptedCount++;
    }
    
    // Recalcular taxa
    this.metrics.encryptionRate = this.metrics.totalSensitive > 0 
      ? (this.metrics.encryptedCount / this.metrics.totalSensitive) * 100 
      : 0;
    
    this.metrics.lastUpdated = new Date();
    
    // Manter histórico (últimas 1000 operações)
    this.metrics.history.push({
      timestamp: new Date(),
      field: fieldType,
      entity: entityType,
      encrypted: wasEncrypted,
      currentRate: this.metrics.encryptionRate
    });
    
    if (this.metrics.history.length > 1000) {
      this.metrics.history = this.metrics.history.slice(-1000);
    }
    
    return this.metrics.encryptionRate;
  }

  // Obter métricas atuais
  getMetrics() {
    return {
      DC: this.metrics.encryptedCount,           // Dados Criptografados
      DT: this.metrics.totalSensitive,           // Total de Dados Sensíveis
      x: Math.round(this.metrics.encryptionRate * 100) / 100,  // Taxa
      formula: 'x = DC ÷ DT × 100',
      lastUpdated: this.metrics.lastUpdated,
      historySize: this.metrics.history.length
    };
  }

  // Gerar relatório
  generateReport() {
    const metrics = this.getMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      metric: 'Taxa de dados criptografados',
      formula: 'x = DC ÷ DT × 100',
      values: {
        DC: metrics.DC,
        DT: metrics.DT,
        x: metrics.x
      },
      interpretation: this.getInterpretation(metrics.x),
      status: this.getStatus(metrics.x),
      recommendations: this.getRecommendations(metrics.x)
    };
  }

  getInterpretation(rate) {
    if (rate >= 95) return 'Excelente - Quase todos os dados sensíveis estão protegidos';
    if (rate >= 80) return 'Bom - Maioria dos dados sensíveis está protegida';
    if (rate >= 60) return 'Regular - Proteção precisa ser melhorada';
    return 'Crítico - Muitos dados sensíveis não estão criptografados';
  }

  getStatus(rate) {
    if (rate >= 95) return 'EXCELLENT';
    if (rate >= 80) return 'GOOD';
    if (rate >= 60) return 'FAIR';
    return 'POOR';
  }

  getRecommendations(rate) {
    const recommendations = [];
    
    if (rate < 100) {
      recommendations.push('Implementar criptografia para campos restantes');
    }
    
    if (rate < 90) {
      recommendations.push('Revisar controllers que não estão aplicando criptografia');
    }
    
    if (rate < 70) {
      recommendations.push('Priorizar criptografia de CPF e dados pessoais críticos');
    }
    
    return recommendations;
  }
}

class CryptoService {
  constructor() {
    this.metrics = new EncryptionMetrics();
    this.encryptionEnabled = true;
  }

  // Criptografar texto
  encrypt(text, fieldType = 'unknown', entityType = 'unknown') {
    if (!this.encryptionEnabled || !text || text === '') {
      this.metrics.recordEncryption(false, fieldType, entityType);
      return { encrypted: false, data: text };
    }
    
    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const salt = crypto.randomBytes(SALT_LENGTH);
      
      const key = crypto.scryptSync(SECRET_KEY, salt, 32);
      const cipher = crypto.createCipher(ALGORITHM, key);
      
      cipher.setAAD(Buffer.from(salt));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      this.metrics.recordEncryption(true, fieldType, entityType);
      
      return {
        encrypted: true,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        data: encrypted,
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('❌ Erro ao criptografar:', error);
      this.metrics.recordEncryption(false, fieldType, entityType);
      return { encrypted: false, data: text };
    }
  }

  // Descriptografar texto
  decrypt(encryptedData) {
    if (!encryptedData.encrypted) {
      return encryptedData.data;
    }
    
    try {
      const { iv, salt, data, authTag } = encryptedData;
      
      const key = crypto.scryptSync(SECRET_KEY, Buffer.from(salt, 'hex'), 32);
      const decipher = crypto.createDecipher(ALGORITHM, key);
      
      decipher.setAAD(Buffer.from(salt, 'hex'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('❌ Erro ao descriptografar:', error);
      throw new Error('Falha na descriptografia');
    }
  }

  // Criptografar dados sensíveis de um objeto
  encryptSensitiveData(data, entityType) {
    if (!this.encryptionEnabled) {
      return { data, stats: { encrypted: 0, total: 0, rate: 0 } };
    }

    const sensitiveFields = SENSITIVE_FIELDS[entityType] || [];
    const encryptedData = { ...data };
    let encryptedCount = 0;
    let totalSensitive = 0;

    sensitiveFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        totalSensitive++;
        const encryptedResult = this.encrypt(String(data[field]), field, entityType);
        
        if (encryptedResult.encrypted) {
          encryptedData[`${field}_encrypted`] = encryptedResult;
          // Manter original apenas para auditoria (remover em produção)
          encryptedData[`${field}_original`] = data[field]; 
          delete encryptedData[field];
          encryptedCount++;
        }
      }
    });

    return {
      data: encryptedData,
      stats: {
        encrypted: encryptedCount,
        total: totalSensitive,
        rate: totalSensitive > 0 ? (encryptedCount / totalSensitive) * 100 : 100
      }
    };
  }

  // Descriptografar dados sensíveis
  decryptSensitiveData(encryptedData, entityType) {
    const sensitiveFields = SENSITIVE_FIELDS[entityType] || [];
    const decryptedData = { ...encryptedData };

    sensitiveFields.forEach(field => {
      const encryptedField = `${field}_encrypted`;
      if (encryptedData[encryptedField]) {
        try {
          decryptedData[field] = this.decrypt(encryptedData[encryptedField]);
          delete decryptedData[encryptedField];
          delete decryptedData[`${field}_original`];
        } catch (error) {
          console.error(`❌ Erro ao descriptografar ${field}:`, error);
          decryptedData[field] = encryptedData[`${field}_original`] || null;
        }
      }
    });

    return decryptedData;
  }

  // Hash para senhas (não conta para métrica de criptografia)
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  verifyPassword(password, storedHash, storedSalt) {
    const hash = crypto.pbkdf2Sync(password, storedSalt, 1000, 64, 'sha512').toString('hex');
    return hash === storedHash;
  }

  // Métricas
  getEncryptionMetrics() {
    return this.metrics.getMetrics();
  }

  generateSecurityReport() {
    return this.metrics.generateReport();
  }

  // Controle
  enableEncryption() {
    this.encryptionEnabled = true;
  }

  disableEncryption() {
    this.encryptionEnabled = false;
  }

  // Reset métricas (apenas para testes)
  resetMetrics() {
    this.metrics = new EncryptionMetrics();
  }
}

// Singleton
const cryptoService = new CryptoService();

module.exports = cryptoService;