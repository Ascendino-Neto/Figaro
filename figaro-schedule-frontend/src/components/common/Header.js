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
              
              {/* ? NOVO: Link para Serviços Disponíveis (apenas clientes) */}
              {user?.type === 'cliente' && (
                <Link to="/servicos-cliente" style={navStyle}>
                  Serviços Disponíveis
                </Link>
              )}
              
              {/* ? Link para Meus Serviços (apenas prestadores) */}
              {user?.type === 'prestador' && (
                <Link to="/servicos" style={navStyle}>
                  Meus Serviços
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                style={{ 
                  ...navStyle, 
                  background: 'none', 
                  border: '1px solid #e74c3c', 
                  color: '#e74c3c',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e74c3c';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'none';
                  e.target.style.color = '#e74c3c';
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/cadastro/cliente" 
                style={navStyle}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                Cliente
              </Link>
              <Link 
                to="/cadastro/prestador" 
                style={navStyle}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                Prestador
              </Link>
              <Link 
                to="/login" 
                style={navStyle}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'none'}
              >
                Login
              </Link>
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
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  fontSize: '14px',
  fontWeight: '500'
};

export default Header;