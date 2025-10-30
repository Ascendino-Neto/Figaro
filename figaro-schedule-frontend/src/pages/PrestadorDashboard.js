// src/pages/PrestadorDashboard.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AgendaPrestador from '../components/prestador/AgendaPrestador';

const PrestadorDashboard = () => {
  const [abaAtiva, setAbaAtiva] = useState('dashboard'); // 'dashboard' ou 'agenda'
  const user = authService.getCurrentUser();

  if (!user || user.type !== 'prestador') {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          <h2>Acesso Negado</h2>
          <p>Esta área é restrita para prestadores de serviço.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>👨‍💼 Dashboard do Prestador</h1>
        <div style={welcomeStyle}>
          <h3>👋 Bem-vindo, {user.name || user.email}!</h3>
          <p>Você está logado como: Prestador de Serviços</p>
        </div>
      </div>

      {/* Navegação entre Abas */}
      <div style={navTabsStyle}>
        <button
          onClick={() => setAbaAtiva('dashboard')}
          style={abaAtiva === 'dashboard' ? tabAtivaStyle : tabStyle}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setAbaAtiva('agenda')}
          style={abaAtiva === 'agenda' ? tabAtivaStyle : tabStyle}
        >
          📅 Minha Agenda
        </button>
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div style={conteudoStyle}>
        {abaAtiva === 'dashboard' && (
          <div style={dashboardContentStyle}>
            {/* Cards de Funcionalidades */}
            <div style={featuresGridStyle}>
              <div style={featureCardStyle}>
                <div style={featureIconStyle}>💼</div>
                <h4>Meus Serviços</h4>
                <p>Gerencie os serviços que você oferece</p>
                <Link to="/servicos" style={featureButtonStyle}>
                  Gerenciar Serviços
                </Link>
              </div>

              <div style={featureCardStyle}>
                <div style={featureIconStyle}>📅</div>
                <h4>Agenda</h4>
                <p>Visualize e gerencie seus agendamentos</p>
                <button 
                  onClick={() => setAbaAtiva('agenda')}
                  style={featureButtonStyle}
                >
                  Ver Agenda
                </button>
              </div>

              <div style={featureCardStyle}>
                <div style={featureIconStyle}>👤</div>
                <h4>Meu Perfil</h4>
                <p>Atualize suas informações</p>
                <button style={featureButtonStyle}>
                  Editar Perfil
                </button>
              </div>

              <div style={featureCardStyle}>
                <div style={featureIconStyle}>💰</div>
                <h4>Financeiro</h4>
                <p>Acompanhe seus ganhos e pagamentos</p>
                <button style={featureButtonStyle}>
                  Ver Financeiro
                </button>
              </div>
            </div>

            {/* Seção de Ação Rápida */}
            <div style={quickActionStyle}>
              <div style={quickActionContentStyle}>
                <h4>🚀 Ação Rápida</h4>
                <p>Cadastre seu primeiro serviço para começar a receber agendamentos</p>
                <Link to="/servicos" style={primaryButtonStyle}>
                  + Cadastrar Novo Serviço
                </Link>
              </div>
            </div>

            {/* Estatísticas Rápidas (Placeholder) */}
            <div style={statsSectionStyle}>
              <h4>📈 Visão Geral</h4>
              <div style={statsGridStyle}>
                <div style={statItemStyle}>
                  <span style={statNumberStyle}>0</span>
                  <span style={statLabelStyle}>Agendamentos Hoje</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statNumberStyle}>0</span>
                  <span style={statLabelStyle}>Serviços Ativos</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statNumberStyle}>R$ 0</span>
                  <span style={statLabelStyle}>Receita do Mês</span>
                </div>
                <div style={statItemStyle}>
                  <span style={statNumberStyle}>0</span>
                  <span style={statLabelStyle}>Avaliações</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'agenda' && <AgendaPrestador />}
      </div>
    </div>
  );
};

// Estilos
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px'
};

const titleStyle = {
  color: '#2c3e50',
  marginBottom: '15px'
};

const welcomeStyle = {
  textAlign: 'center',
  padding: '20px',
  background: '#ecf0f1',
  borderRadius: '8px',
  marginBottom: '20px'
};

const navTabsStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '30px',
  borderBottom: '2px solid #ecf0f1',
  gap: '10px'
};

const tabStyle = {
  padding: '12px 24px',
  background: 'none',
  border: 'none',
  borderBottom: '3px solid transparent',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#7f8c8d',
  transition: 'all 0.3s',
  borderRadius: '5px 5px 0 0'
};

const tabAtivaStyle = {
  ...tabStyle,
  color: '#3498db',
  borderBottom: '3px solid #3498db',
  fontWeight: '600',
  background: '#f8f9fa'
};

const conteudoStyle = {
  minHeight: '500px'
};

const dashboardContentStyle = {
  animation: 'fadeIn 0.5s ease-in'
};

const featuresGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '25px',
  marginBottom: '40px'
};

const featureCardStyle = {
  padding: '25px',
  background: 'white',
  borderRadius: '12px',
  textAlign: 'center',
  border: '1px solid #e1e8ed',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  transition: 'transform 0.3s, box-shadow 0.3s',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const featureIconStyle = {
  fontSize: '40px',
  marginBottom: '15px'
};

const featureButtonStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '15px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'background 0.3s'
};

const quickActionStyle = {
  marginBottom: '40px',
  padding: '30px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: '12px',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
};

const quickActionContentStyle = {
  maxWidth: '500px',
  margin: '0 auto'
};

const primaryButtonStyle = {
  display: 'inline-block',
  padding: '12px 30px',
  background: '#2ecc71',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '6px',
  fontWeight: 'bold',
  marginTop: '15px',
  fontSize: '16px',
  transition: 'background 0.3s',
  border: 'none',
  cursor: 'pointer'
};

const statsSectionStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  border: '1px solid #e1e8ed',
  boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const statItemStyle = {
  textAlign: 'center',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6'
};

const statNumberStyle = {
  display: 'block',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '5px'
};

const statLabelStyle = {
  fontSize: '14px',
  color: '#7f8c8d',
  fontWeight: '500'
};

const errorStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  background: '#f8d7da',
  color: '#721c24',
  borderRadius: '8px',
  maxWidth: '500px',
  margin: '50px auto'
};

// Efeitos de hover
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
  console.log('CSS keyframes já existem ou não podem ser inseridos');
}

// Adicionar estilos de hover
featureCardStyle[':hover'] = {
  transform: 'translateY(-5px)',
  boxShadow: '0 5px 20px rgba(0,0,0,0.15)'
};

featureButtonStyle[':hover'] = {
  background: '#2980b9'
};

primaryButtonStyle[':hover'] = {
  background: '#27ae60'
};

export default PrestadorDashboard;