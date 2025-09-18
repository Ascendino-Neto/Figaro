import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
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
        
        <nav>
          <Link to="/cadastro/cliente" style={navStyle}>Cliente</Link>
          <Link to="/cadastro/prestador" style={navStyle}>Prestador</Link>
          <Link to="/login" style={navStyle}>Login</Link>
          <Link to="/dashboard" style={navStyle}>Dashboard</Link>
        </nav>
      </div>
    </header>
  );
};

const navStyle = {
  color: 'white',
  textDecoration: 'none',
  marginLeft: '20px',
  padding: '8px 15px',
  border: '1px solid white',
  borderRadius: '5px'
};

export default Header;