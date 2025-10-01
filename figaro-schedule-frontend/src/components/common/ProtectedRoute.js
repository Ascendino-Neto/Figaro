import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ProtectedRoute = ({ children, requiredType }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ CORREÇÃO: Redirecionamento mais específico
  if (requiredType && user.type !== requiredType) {
    // Se a rota requer prestador mas o usuário é cliente
    if (requiredType === 'prestador' && user.type === 'cliente') {
      return <Navigate to="/dashboard" replace />;
    }
    // Se a rota requer cliente mas o usuário é prestador  
    if (requiredType === 'cliente' && user.type === 'prestador') {
      return <Navigate to="/prestador/dashboard" replace />;
    }
  }

  // ✅ CORREÇÃO: Proteção adicional para rotas específicas
  if (!requiredType) {
    // Se não tem requiredType, redireciona baseado no tipo de usuário
    if (user.type === 'prestador') {
      return <Navigate to="/prestador/dashboard" replace />;
    }
    // Clientes ficam na rota atual
  }

  return children;
};

export default ProtectedRoute;