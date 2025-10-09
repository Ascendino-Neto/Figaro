import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div style={heroStyle}>
        <h1>Bem-vindo ao FigaroSchedule</h1>
        <p>Sistema completo de agendamento para sua barbearia</p>
      </div>

      <div style={featuresStyle}>
        <div style={featureCardStyle}>
          <h3>Cadastro de Clientes</h3>
          <p>Gerencie seus clientes com validação de CPF e dados completos</p>
          <Link to="/cadastro/cliente" style={featureButtonStyle}>
            Cadastrar Cliente
          </Link>
        </div>

        <div style={featureCardStyle}>
          <h3>Área de Prestadores</h3>
          <p>Cadastre e gerencie profissionais da sua equipe</p>
          <Link to="/cadastro/prestador" style={featureButtonStyle}>
            Cadastrar Prestador
          </Link>
        </div>

        <div style={featureCardStyle}>
          <h3>Sistema de Login</h3>
          <p>Acesso seguro para clientes e prestadores</p>
          <Link to="/login" style={featureButtonStyle}>
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const heroStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '10px',
  marginBottom: '40px'
};

const featuresStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const featureCardStyle = {
  padding: '20px',
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  textAlign: 'center'
};

const featureButtonStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  background: '#3498db',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  marginTop: '15px'
};

export default Home;