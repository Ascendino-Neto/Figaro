import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const SecurityMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [realTimeData, setRealTimeData] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Atualizar métricas a cada 5 segundos
    const metricsInterval = setInterval(updateMetrics, 5000);
    
    // Simular dados em tempo real
    const realTimeInterval = setInterval(updateRealTimeData, 2000);
    
    updateMetrics();
    
    return () => {
      clearInterval(metricsInterval);
      clearInterval(realTimeInterval);
    };
  }, []);

  const updateMetrics = () => {
    const securityMetrics = authService.getSecurityMetrics();
    setMetrics(securityMetrics);
    
    // Verificar se há novas atividades suspeitas
    checkNewAlerts(securityMetrics);
  };

  const updateRealTimeData = () => {
    // Simular eventos de login em tempo real
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: Math.random() > 0.7 ? 'suspicious' : 'normal',
      email: `user${Math.floor(Math.random() * 100)}@example.com`,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      status: Math.random() > 0.3 ? 'success' : 'failed'
    };
    
    setRealTimeData(prev => [newEvent, ...prev.slice(0, 19)]); // Manter últimos 20
  };

  const checkNewAlerts = (currentMetrics) => {
    if (metrics && currentMetrics.suspiciousAttempts > metrics.suspiciousAttempts) {
      const newAlert = {
        id: Date.now(),
        type: 'new_suspicious_activity',
        message: 'Nova atividade suspeita detectada!',
        timestamp: new Date().toISOString(),
        severity: 'high'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const getStatusColor = (rate) => {
    if (rate >= 80) return '#00C851'; // Verde
    if (rate >= 60) return '#FFBB33'; // Amarelo
    if (rate >= 40) return '#FF8800'; // Laranja
    return '#FF4444'; // Vermelho
  };

  if (!metrics) return <div>Carregando monitor de segurança...</div>;

  return (
    <div style={containerStyle}>
      {/* Cabeçalho */}
      <div style={headerStyle}>
        <h1>🛡️ Monitor de Segurança em Tempo Real</h1>
        <div style={timestampStyle}>
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Cartões de Métricas Principais */}
      <div style={metricsGridStyle}>
        <div style={metricCardStyle}>
          <div style={metricIconStyle}>📈</div>
          <div style={metricValueStyle} className="pulse">
            {metrics.detectionRate}%
          </div>
          <div style={metricLabelStyle}>Taxa de Detecção</div>
          <div style={progressBarStyle}>
            <div 
              style={{
                ...progressFillStyle,
                width: `${metrics.detectionRate}%`,
                background: getStatusColor(metrics.detectionRate)
              }}
            />
          </div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricIconStyle}>🚨</div>
          <div style={metricValueStyle}>{metrics.suspiciousAttempts}</div>
          <div style={metricLabelStyle}>Atividades Suspeitas</div>
          <div style={metricTrendStyle}>
            {metrics.suspiciousAttempts > 0 ? '⚠️ Monitorando' : '✅ Tudo normal'}
          </div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricIconStyle}>🔒</div>
          <div style={metricValueStyle}>{metrics.blockedUsers}</div>
          <div style={metricLabelStyle}>Contas Bloqueadas</div>
          <div style={metricSubTextStyle}>
            {metrics.blockedUsers > 0 ? 'Intervenção necessária' : 'Nenhum bloqueio'}
          </div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricIconStyle}>📊</div>
          <div style={metricValueStyle}>{metrics.totalAttempts}</div>
          <div style={metricLabelStyle}>Tentativas Totais</div>
          <div style={metricSubTextStyle}>
            Hoje: {Math.floor(metrics.totalAttempts * 0.3)}
          </div>
        </div>
      </div>

      {/* Gráfico de Tendência */}
      <div style={chartSectionStyle}>
        <h3>📈 Tendência da Taxa de Detecção</h3>
        <div style={chartContainerStyle}>
          <div style={chartStyle}>
            {/* Simulação de gráfico - em produção usar Chart.js ou similar */}
            <div style={chartBarsStyle}>
              {[65, 72, 68, 75, 80, metrics.detectionRate].map((value, index) => (
                <div key={index} style={chartBarStyle(value)} title={`${value}%`}>
                  <div style={chartBarFillStyle(value)} />
                </div>
              ))}
            </div>
            <div style={chartLabelsStyle}>
              <span>15:00</span>
              <span>16:00</span>
              <span>17:00</span>
              <span>18:00</span>
              <span>19:00</span>
              <span style={{fontWeight: 'bold'}}>Agora</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas em Tempo Real */}
      <div style={alertsSectionStyle}>
        <div style={alertsHeaderStyle}>
          <h3>🚨 Alertas Recentes</h3>
          <span style={alertsBadgeStyle}>{alerts.length}</span>
        </div>
        <div style={alertsListStyle}>
          {alerts.length === 0 ? (
            <div style={noAlertsStyle}>✅ Nenhum alerta recente</div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} style={alertItemStyle(alert.severity)}>
                <div style={alertIconStyle}>⚠️</div>
                <div style={alertContentStyle}>
                  <div style={alertMessageStyle}>{alert.message}</div>
                  <div style={alertTimeStyle}>
                    {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Atividade em Tempo Real */}
      <div style={activitySectionStyle}>
        <h3>🔍 Atividade de Login em Tempo Real</h3>
        <div style={activityListStyle}>
          {realTimeData.map(event => (
            <div key={event.id} style={activityItemStyle(event.type)}>
              <div style={activityIconStyle}>
                {event.type === 'suspicious' ? '🚨' : '👤'}
              </div>
              <div style={activityDetailsStyle}>
                <span style={activityEmailStyle}>{event.email}</span>
                <span style={activityIpStyle}>{event.ip}</span>
                <span style={activityStatusStyle(event.status)}>
                  {event.status === 'success' ? '✅ Sucesso' : '❌ Falha'}
                </span>
              </div>
              <div style={activityTimeStyle}>
                {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div style={controlsStyle}>
        <button 
          onClick={updateMetrics}
          style={controlButtonStyle}
        >
          🔄 Atualizar Agora
        </button>
        <button 
          onClick={() => setAlerts([])}
          style={controlButtonStyle}
        >
          🗑️ Limpar Alertas
        </button>
        <button 
          onClick={() => authService.clearSecurityData()}
          style={controlButtonStyle}
        >
          🧹 Limpar Dados
        </button>
      </div>
    </div>
  );
};

// Estilos
const containerStyle = {
  padding: '20px',
  background: '#f8f9fa',
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
  padding: '20px',
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const timestampStyle = {
  color: '#6c757d',
  fontSize: '14px'
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px'
};

const metricCardStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  textAlign: 'center',
  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  border: '1px solid #e1e8ed',
  transition: 'transform 0.2s'
};

const metricIconStyle = {
  fontSize: '40px',
  marginBottom: '15px'
};

const metricValueStyle = {
  fontSize: '36px',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '5px'
};

const metricLabelStyle = {
  fontSize: '16px',
  color: '#6c757d',
  marginBottom: '15px',
  fontWeight: '500'
};

const metricTrendStyle = {
  fontSize: '14px',
  padding: '5px 10px',
  background: '#e8f4fd',
  color: '#3498db',
  borderRadius: '20px',
  display: 'inline-block'
};

const metricSubTextStyle = {
  fontSize: '12px',
  color: '#95a5a6',
  marginTop: '5px'
};

const progressBarStyle = {
  width: '100%',
  height: '8px',
  background: '#ecf0f1',
  borderRadius: '4px',
  overflow: 'hidden',
  marginTop: '10px'
};

const progressFillStyle = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.5s ease'
};

const chartSectionStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  marginBottom: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const chartContainerStyle = {
  marginTop: '20px'
};

const chartStyle = {
  height: '200px',
  display: 'flex',
  flexDirection: 'column'
};

const chartBarsStyle = {
  display: 'flex',
  alignItems: 'end',
  justifyContent: 'space-between',
  height: '150px',
  padding: '0 20px'
};

const chartBarStyle = (value) => ({
  width: '40px',
  height: '100%',
  display: 'flex',
  alignItems: 'end',
  position: 'relative'
});

const chartBarFillStyle = (value) => ({
  width: '100%',
  height: `${value}%`,
  background: value >= 80 ? '#00C851' : value >= 60 ? '#FFBB33' : '#FF4444',
  borderRadius: '4px 4px 0 0',
  transition: 'height 0.5s ease'
});

const chartLabelsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 20px 0 20px',
  fontSize: '12px',
  color: '#6c757d'
};

const alertsSectionStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  marginBottom: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const alertsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '20px'
};

const alertsBadgeStyle = {
  background: '#e74c3c',
  color: 'white',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const alertsListStyle = {
  maxHeight: '200px',
  overflowY: 'auto'
};

const alertItemStyle = (severity) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '15px',
  marginBottom: '10px',
  background: severity === 'high' ? '#ffeaea' : '#fff3cd',
  border: `1px solid ${severity === 'high' ? '#f5c6cb' : '#ffeaa7'}`,
  borderRadius: '8px',
  animation: 'fadeIn 0.5s ease'
});

const alertIconStyle = {
  fontSize: '20px',
  marginRight: '15px'
};

const alertContentStyle = {
  flex: 1
};

const alertMessageStyle = {
  fontWeight: 'bold',
  marginBottom: '5px'
};

const alertTimeStyle = {
  fontSize: '12px',
  color: '#6c757d'
};

const noAlertsStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#6c757d',
  fontStyle: 'italic'
};

const activitySectionStyle = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  marginBottom: '30px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const activityListStyle = {
  maxHeight: '300px',
  overflowY: 'auto'
};

const activityItemStyle = (type) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 15px',
  borderBottom: '1px solid #ecf0f1',
  background: type === 'suspicious' ? '#fff5f5' : 'transparent',
  animation: 'slideIn 0.3s ease'
});

const activityIconStyle = {
  fontSize: '18px',
  marginRight: '15px'
};

const activityDetailsStyle = {
  flex: 1,
  display: 'flex',
  gap: '15px',
  alignItems: 'center'
};

const activityEmailStyle = {
  fontWeight: '500',
  minWidth: '120px'
};

const activityIpStyle = {
  color: '#6c757d',
  fontSize: '12px',
  fontFamily: 'monospace'
};

const activityStatusStyle = (status) => ({
  fontSize: '12px',
  fontWeight: 'bold',
  color: status === 'success' ? '#27ae60' : '#e74c3c'
});

const activityTimeStyle = {
  fontSize: '12px',
  color: '#95a5a6'
};

const controlsStyle = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'center',
  padding: '20px'
};

const controlButtonStyle = {
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500'
};

// Animações CSS
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.pulse {
  animation: pulse 2s infinite;
}
`;

// Adicionar estilos ao documento
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default SecurityMonitor;