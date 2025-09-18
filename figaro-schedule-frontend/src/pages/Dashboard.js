import React from 'react';
import { authService } from '../services/authService';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Dashboard</h2>
        
        <div style={welcomeStyle}>
          <h3>?? Bem-vindo, {user.email}!</h3>
          <p>Você está logado como: {user.type}</p>
        </div>

        <div style={featuresGridStyle}>
          <div style={featureCardStyle}>
            <h4>?? Meus Agendamentos</h4>
            <p>Visualize e gerencie seus agendamentos</p>
            <button style={featureButtonStyle}>
              Ver Agendamentos
            </button>
          </div>

          <div style={featureCardStyle}>
            <h4>?? Meu Perfil</h4>
            <p>Atualize suas informações pessoais</p>
            <button style={featureButtonStyle}>
              Editar Perfil
            </button>
          </div>

          <div style={featureCardStyle}>
            <h4>?? Estatísticas</h4>
            <p>Veja suas estatísticas de uso</p>
            <button style={featureButtonStyle}>
              Ver Estatísticas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '800px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '30px'
};

const welcomeStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  padding: '20px',
  background: '#ecf0f1',
  borderRadius: '8px'
};

const featuresGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginTop: '30px'
};

const featureCardStyle = {
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  textAlign: 'center',
  border: '1px solid #dee2e6'
};

const featureButtonStyle = {
  padding: '8px 16px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

export default Dashboard;