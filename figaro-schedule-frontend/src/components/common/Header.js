import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
  const [user, setUser] = useState(authService.getCurrentUser());

  // Atualiza estado quando a rota muda
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
    setUser(authService.getCurrentUser());
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  // ? CORREÇÃO: Função para determinar o link do dashboard
  const getDashboardLink = () => {
    if (user?.type === 'prestador') {
      return '/prestador/dashboard';
    }
    return '/dashboard';
  };

  return (
    <header style={{ 
      padding: '20px', 
      background: '#2c3e50', 
      color: 'white',
      marginBottom: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>FigaroSchedule</h1>
        </Link>
        
        <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '15px' }}>
                Olá, {user?.email}
              </span>
              
              {/* ? CORREÇÃO: Link dinâmico para dashboard */}
              <Link to={getDashboardLink()} style={navStyle}>
                Dashboard
              </Link>
              
              {user?.type === 'prestador' && (
                <Link to="/servicos" style={navStyle}>Meus Serviços</Link>
              )}
              
              <button 
                onClick={handleLogout}
                style={{ ...navStyle, background: 'none', border: '1px solid #e74c3c', color: '#e74c3c' }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/cadastro/cliente" style={navStyle}>Cliente</Link>
              <Link to="/cadastro/prestador" style={navStyle}>Prestador</Link>
              <Link to="/login" style={navStyle}>Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const navStyle = {
  color: 'white',
  textDecoration: 'none',
  padding: '8px 15px',
  border: '1px solid white',
  borderRadius: '5px',
  background: 'none',
  cursor: 'pointer'
};

export default Header;