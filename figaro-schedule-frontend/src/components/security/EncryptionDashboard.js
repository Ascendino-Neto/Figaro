import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EncryptionDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEncryptionMetrics();
    const interval = setInterval(loadEncryptionMetrics, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadEncryptionMetrics = async () => {
    try {
      const response = await api.get('/encryption/metrics');
      
      if (response.data.success) {
        setMetrics(response.data);
        setError('');
      } else {
        setError('Erro ao carregar métricas');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar métricas:', error);
      setError('Não foi possível conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  const getRateColor = (rate) => {
    if (rate >= 95) return '#00C851'; // Verde
    if (rate >= 80) return '#FFBB33'; // Amarelo  
    if (rate >= 60) return '#FF8800'; // Laranja
    return '#FF4444'; // Vermelho
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'EXCELLENT': return '🎉';
      case 'GOOD': return '👍';
      case 'FAIR': return '⚠️';
      case 'POOR': return '🚨';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <h3>Carregando métricas de criptografia...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStyle}>
        <h3>❌ Erro</h3>
        <p>{error}</p>
        <button onClick={loadEncryptionMetrics} style={retryButtonStyle}>
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={errorStyle}>
        <h3>❌ Dados não disponíveis</h3>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <h1>🔐 Métrica de Segurança 2</h1>
        <h2>Taxa de dados criptografados</h2>
        <p>Fórmula: x = DC ÷ DT × 100</p>
      </div>

      {/* Cartão Principal */}
      <div style={mainCardStyle}>
        <div style={formulaDisplayStyle}>
          <div style={formulaStyle}>
            x = {metrics.values.DC} ÷ {metrics.values.DT} × 100
          </div>
          <div style={resultStyle}>
            = <span style={{color: getRateColor(metrics.values.x)}}>{metrics.values.x}%</span>
          </div>
        </div>

        <div style={statusStyle}>
          <span style={statusIconStyle}>{getStatusIcon(metrics.status)}</span>
          <strong>{metrics.status}</strong> - {metrics.interpretation}
        </div>

        {/* Barra de Progresso */}
        <div style={progressContainerStyle}>
          <div style={progressBarStyle}>
            <div 
              style={{
                ...progressFillStyle,
                width: `${metrics.values.x}%`,
                background: getRateColor(metrics.values.x)
              }}
            />
          </div>
          <div style={progressLabelsStyle}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{metrics.values.DC}</div>
          <div style={statLabelStyle}>DC - Dados Criptografados</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{metrics.values.DT}</div>
          <div style={statLabelStyle}>DT - Total de Dados Sensíveis</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={statNumberStyle}>{metrics.values.x}%</div>
          <div style={statLabelStyle}>x - Taxa de Criptografia</div>
        </div>
      </div>

      {/* Recomendações */}
      {metrics.recommendations && metrics.recommendations.length > 0 && (
        <div style={recommendationsStyle}>
          <h3>💡 Recomendações</h3>
          <ul>
            {metrics.recommendations.map((rec, index) => (
              <li key={index} style={recommendationItemStyle}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ações */}
      <div style={actionsStyle}>
        <button onClick={loadEncryptionMetrics} style={actionButtonStyle}>
          🔄 Atualizar Métricas
        </button>
        <div style={lastUpdateStyle}>
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Legenda */}
      <div style={legendStyle}>
        <h4>📖 Interpretação da Métrica</h4>
        <div style={legendGridStyle}>
          <div style={legendItemStyle}>
            <span style={legendColorStyle('#00C851')}></span>
            <span>90-100%: Excelente proteção</span>
          </div>
          <div style={legendItemStyle}>
            <span style={legendColorStyle('#FFBB33')}></span>
            <span>70-89%: Boa proteção</span>
          </div>
          <div style={legendItemStyle}>
            <span style={legendColorStyle('#FF8800')}></span>
            <span>50-69%: Proteção regular</span>
          </div>
          <div style={legendItemStyle}>
            <span style={legendColorStyle('#FF4444')}></span>
            <span>0-49%: Proteção crítica</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos (mantenha os estilos do componente anterior)
const containerStyle = {
  padding: '20px',
  maxWidth: '800px',
  margin: '0 auto',
  fontFamily: 'Arial, sans-serif'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#2c3e50'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d'
};

const errorStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e74c3c',
  background: '#f8d7da',
  borderRadius: '8px'
};

const mainCardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  marginBottom: '20px',
  textAlign: 'center'
};

const formulaDisplayStyle = {
  marginBottom: '20px'
};

const formulaStyle = {
  fontFamily: 'monospace',
  fontSize: '18px',
  background: '#f8f9fa',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '10px'
};

const resultStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '10px 0'
};

const statusStyle = {
  fontSize: '16px',
  margin: '15px 0',
  padding: '10px',
  background: '#e8f4fd',
  borderRadius: '5px'
};

const statusIconStyle = {
  fontSize: '20px',
  marginRight: '10px'
};

const progressContainerStyle = {
  margin: '20px 0'
};

const progressBarStyle = {
  width: '100%',
  height: '20px',
  background: '#ecf0f1',
  borderRadius: '10px',
  overflow: 'hidden',
  marginBottom: '5px'
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '10px',
  transition: 'width 0.5s ease'
};

const progressLabelsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#7f8c8d'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '15px',
  marginBottom: '20px'
};

const statCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const statNumberStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '5px'
};

const statLabelStyle = {
  fontSize: '12px',
  color: '#7f8c8d'
};

const recommendationsStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginBottom: '20px'
};

const recommendationItemStyle = {
  marginBottom: '8px',
  lineHeight: '1.4'
};

const actionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const actionButtonStyle = {
  padding: '10px 20px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const lastUpdateStyle = {
  fontSize: '12px',
  color: '#7f8c8d'
};

const legendStyle = {
  background: 'white',
  padding: '15px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const legendGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '10px',
  marginTop: '10px'
};

const legendItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const legendColorStyle = (color) => ({
  width: '15px',
  height: '15px',
  background: color,
  borderRadius: '3px'
});

const retryButtonStyle = {
  padding: '8px 16px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

export default EncryptionDashboard;