import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  // ? CORRE��O: Remove o redirecionamento autom�tico
  // O redirecionamento j� foi feito no Login.js
  // Se um prestador chegou aqui, � porque clicou no link errado
  
  // Se for cliente, mostra dashboard do cliente
  if (user?.type === 'cliente') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Dashboard do Cliente</h2>
          
          <div style={welcomeStyle}>
            <h3>Bem-vindo, {user.email}!</h3>
            <p>Área exclusiva para clientes da FigaroSchedule</p>
          </div>

          <div style={featuresGridStyle}>
            <div style={featureCardStyle}>
              <h4>Agendar Serviço</h4>
              <p>Agende seu corte de cabelo, barba e outros serviços</p>
              <button style={featureButtonStyle}>
                Fazer Agendamento
              </button>
            </div>

            <div style={featureCardStyle}>
              <h4>Meus Agendamentos</h4>
              <p>Visualize e gerencie seus agendamentos</p>
              <button style={featureButtonStyle}>
                Ver Agendamentos
              </button>
            </div>

            <div style={featureCardStyle}>
              <h4>Meu Perfil</h4>
              <p>Atualize suas informações pessoais</p>
              <button style={featureButtonStyle}>
                Editar Perfil
              </button>
            </div>

            <div style={featureCardStyle}>
              <h4>Serviços Disponíveis</h4>
              <p>Conheça todos os serviços oferecidos</p>
              <Link to="/servicos" style={featureLinkStyle}>
                Ver Serviços
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ? CORRE��O: Se for prestador, mostra mensagem de erro
  if (user?.type === 'prestador') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={errorStyle}>
            <h3>?? Acesso Restrito</h3>
            <p>Esta área é exclusiva para clientes.</p>
            <p>Você está logado como <strong>prestador</strong>.</p>
            <Link to="/prestador/dashboard" style={primaryButtonStyle}>
              Ir para Dashboard do Prestador
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={loadingStyle}>
          <p>Carregando...</p>
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
  minHeight: '60vh'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '900px'
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

const featureLinkStyle = {
  display: 'inline-block',
  padding: '8px 16px',
  background: '#2ecc71',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  fontSize: '14px'
};

const errorStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e74c3c'
};

const primaryButtonStyle = {
  display: 'inline-block',
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  marginTop: '20px',
  fontSize: '16px'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d'
};

export default Dashboard;