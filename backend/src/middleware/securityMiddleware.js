const cryptoUtils = require('../utils/cryptoUtils');
const db = require('../config/db');

// Proteção contra força bruta
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

const securityMiddleware = {
  // Rate limiting para login
  rateLimitLogin: (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const email = req.body.email;
    
    const key = `${ip}_${email}`;
    const now = Date.now();
    
    if (loginAttempts.has(key)) {
      const attempts = loginAttempts.get(key);
      
      // Limpar tentativas antigas
      const recentAttempts = attempts.filter(time => now - time < LOCKOUT_TIME);
      
      if (recentAttempts.length >= MAX_ATTEMPTS) {
        console.warn(`🚨 Tentativa de força bruta detectada: ${email} from ${ip}`);
        return res.status(429).json({
          success: false,
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
        });
      }
      
      loginAttempts.set(key, [...recentAttempts, now]);
    } else {
      loginAttempts.set(key, [now]);
    }
    
    next();
  },

  // Validar força da senha
  validatePasswordStrength: (req, res, next) => {
    const { senha } = req.body;
    
    if (!senha) {
      return res.status(400).json({
        success: false,
        error: 'Senha é obrigatória'
      });
    }
    
    // Critérios de senha forte
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumbers = /\d/.test(senha);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(senha);
    
    if (senha.length < minLength) {
      return res.status(400).json({
        success: false,
        error: `Senha deve ter pelo menos ${minLength} caracteres`
      });
    }
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais'
      });
    }
    
    next();
  },

  // Criptografar dados sensíveis antes de salvar
  encryptSensitiveData: (req, res, next) => {
    if (req.body.senha) {
      const { hash, salt } = cryptoUtils.hashPassword(req.body.senha);
      req.body.senha_hash = hash;
      req.body.senha_salt = salt;
      delete req.body.senha; // Remove a senha em texto puro
    }
    
    // Criptografar outros dados sensíveis se presentes
    const sensitiveFields = ['cpf', 'telefone', 'email'];
    sensitiveFields.forEach(field => {
      if (req.body[field]) {
        req.body[`${field}_criptografado`] = cryptoUtils.encryptSensitiveData(req.body[field]);
        delete req.body[field]; // Remove o dado em texto puro
      }
    });
    
    next();
  },

  // Log de atividades de segurança
  logSecurityEvent: (event, details) => {
    const timestamp = new Date().toISOString();
    console.log(`🔒 [${timestamp}] ${event}:`, details);
    
    // Em produção, salvar em um sistema de logs
    // Ex: Salvar no banco de dados ou enviar para SIEM
  },

  // Validar sessão/token
  validateSession: async (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação necessário'
      });
    }
    
    // Em produção, validar JWT com expiração
    // Por enquanto, validação básica
    if (!token.startsWith('token_jwt_')) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    next();
  },

  // Controle de acesso baseado em roles
  requireRole: (allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.tipo; // Assumindo que o user é injetado pelo auth middleware
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        securityMiddleware.logSecurityEvent('TENTATIVA_ACESSO_NAO_AUTORIZADO', {
          user: req.user?.email,
          role: userRole,
          allowedRoles,
          path: req.path
        });
        
        return res.status(403).json({
          success: false,
          error: 'Acesso não autorizado'
        });
      }
      
      next();
    };
  }
};

// Limpar tentativas antigas periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of loginAttempts.entries()) {
    const recentAttempts = attempts.filter(time => now - time < LOCKOUT_TIME);
    if (recentAttempts.length === 0) {
      loginAttempts.delete(key);
    } else {
      loginAttempts.set(key, recentAttempts);
    }
  }
}, 60 * 1000); // A cada minuto

module.exports = securityMiddleware;