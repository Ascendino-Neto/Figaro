import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';

const PrestadorDashboard = () => {
  const user = authService.getCurrentUser();

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Dashboard do Prestador</h2>
        
        <div style={welcomeStyle}>
          <h3>👋 Bem-vindo, {user.email}!</h3>
          <p>Você está logado como: Prestador de Serviços</p>
        </div>

        <div style={featuresGridStyle}>
          <div style={featureCardStyle}>
            <h4>💼 Meus Serviços</h4>
            <p>Gerencie os serviços que você oferece</p>
            {/* ✅ LINK CORRETO para serviços */}
            <Link to="/servicos" style={featureButtonStyle}>
              Gerenciar Serviços
            </Link>
          </div>

          <div style={featureCardStyle}>
            <h4>📅 Agenda</h4>
            <p>Visualize e gerencie seus agendamentos</p>
            <button style={featureButtonStyle}>
              Ver Agenda
            </button>
          </div>

          <div style={featureCardStyle}>
            <h4>👤 Meu Perfil</h4>
            <p>Atualize suas informações</p>
            <button style={featureButtonStyle}>
              Editar Perfil
            </button>
          </div>

          <div style={featureCardStyle}>
            <h4>💰 Financeiro</h4>
            <p>Acompanhe seus ganhos e pagamentos</p>
            <button style={featureButtonStyle}>
              Ver Financeiro
            </button>
          </div>
        </div>

        {/* ✅ SEÇÃO DE AÇÃO RÁPIDA PARA CADASTRAR SERVIÇO */}
        <div style={quickActionStyle}>
          <h4>🚀 Ação Rápida</h4>
          <p>Cadastre seu primeiro serviço para começar a receber agendamentos</p>
          <Link to="/servicos" style={primaryButtonStyle}>
            + Cadastrar Novo Serviço
          </Link>
        </div>
      </div>
    </div>
  );
};

// Estilos (mantenha os anteriores e adicione estes)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '1000px'
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
  marginBottom: '30px'
};

const featureCardStyle = {
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  textAlign: 'center',
  border: '1px solid #dee2e6',
  minHeight: '180px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const featureButtonStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  textDecoration: 'none',
  fontSize: '14px'
};

const quickActionStyle = {
  marginTop: '30px',
  padding: '25px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '10px',
  textAlign: 'center'
};

const primaryButtonStyle = {
  display: 'inline-block',
  padding: '12px 30px',
  background: '#2ecc71',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold',
  marginTop: '15px',
  fontSize: '16px'
};

export default PrestadorDashboard;