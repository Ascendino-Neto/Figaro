import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
    window.location.reload();
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
                Olá, {user.email}
              </span>
              <Link to="/dashboard" style={navStyle}>Dashboard</Link>
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