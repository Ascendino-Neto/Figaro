// src/components/security/SecurityValidationPanel.js
import React, { useState, useEffect } from 'react';
import { securityService } from '../../services/securityService';
import { SecurityValidator } from '../../utils/securityValidation';

const SecurityValidationPanel = () => {
  const [metrics, setMetrics] = useState(null);
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateMetrics = () => {
    const currentMetrics = securityService.calculateSecurityMetrics();
    setMetrics(currentMetrics);
  };

  const runValidationTests = async () => {
    setIsValidating(true);
    try {
      const results = await SecurityValidator.simulateLoginScenarios();
      setValidationResults(results);
    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const validateFormula = () => {
    if (!metrics) return null;

    const { suspiciousAttempts: LS, totalAttempts: LT, detectionRate: x } = metrics;
    
    // Verificar se a fórmula está correta
    const calculatedRate = LT > 0 ? (LS / LT) * 100 : 0;
    const formulaIsCorrect = Math.abs(calculatedRate - x) < 0.01;

    return {
      formula: `x = ${LS} ÷ ${LT} × 100 = ${x}%`,
      calculated: `${calculatedRate}%`,
      isCorrect: formulaIsCorrect,
      difference: Math.abs(calculatedRate - x)
    };
  };

  const formulaValidation = validateFormula();

  return (
    <div style={containerStyle}>
      <h2>🔍 Validação - Métrica de Segurança 1</h2>
      <h3>Taxa de tentativas de login suspeitas detectadas</h3>

      {/* Fórmula e Cálculo */}
      <div style={formulaSectionStyle}>
        <h4>📐 Fórmula: x = LS ÷ LT × 100</h4>
        <div style={formulaDisplayStyle}>
          <div style={variableStyle}>
            <strong>LS (Logins Suspeitos):</strong> {metrics?.suspiciousAttempts || 0}
          </div>
          <div style={variableStyle}>
            <strong>LT (Tentativas Totais):</strong> {metrics?.totalAttempts || 0}
          </div>
          <div style={resultStyle}>
            <strong>x (Taxa de Detecção):</strong> {metrics?.detectionRate || 0}%
          </div>
        </div>
        
        {formulaValidation && (
          <div style={{
            ...validationStyle,
            background: formulaValidation.isCorrect ? '#d4edda' : '#f8d7da'
          }}>
            {formulaValidation.isCorrect ? '✅' : '❌'}
            Fórmula Validada: {formulaValidation.formula}
            {!formulaValidation.isCorrect && (
              <span style={{color: '#721c24', fontSize: '12px'}}>
                <br/>Divergência: {formulaValidation.difference.toFixed(4)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Validação Automática */}
      <div style={validationSectionStyle}>
        <h4>🧪 Testes de Validação</h4>
        <button 
          onClick={runValidationTests}
          disabled={isValidating}
          style={validateButtonStyle}
        >
          {isValidating ? '🔄 Validando...' : '🚀 Executar Testes'}
        </button>

        {validationResults && (
          <div style={resultsStyle}>
            <h5>Resultados dos Testes:</h5>
            <div style={{
              padding: '10px',
              background: validationResults.isValid ? '#d4edda' : '#f8d7da',
              borderRadius: '5px',
              marginBottom: '15px'
            }}>
              <strong>
                {validationResults.isValid ? '✅ VALIDAÇÃO BEM-SUCEDIDA' : '❌ VALIDAÇÃO FALHOU'}
              </strong>
              <br/>
              Taxa de Sucesso: {validationResults.overallRate.toFixed(1)}%
            </div>

            {validationResults.details.map((detail, index) => (
              <div key={index} style={testResultStyle}>
                <span>{detail.valid ? '✅' : '❌'} {detail.scenario}</span>
                <span>Suspeitas: {detail.actualSuspicious}/{detail.expectedSuspicious}</span>
                <span>Taxa: {detail.metricValue.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Métricas em Tempo Real */}
      <div style={metricsSectionStyle}>
        <h4>📊 Métricas em Tempo Real</h4>
        <div style={metricsGridStyle}>
          <div style={metricCardStyle}>
            <div style={metricValueStyle}>{metrics?.suspiciousAttempts || 0}</div>
            <div style={metricLabelStyle}>LS - Logins Suspeitos</div>
          </div>
          <div style={metricCardStyle}>
            <div style={metricValueStyle}>{metrics?.totalAttempts || 0}</div>
            <div style={metricLabelStyle}>LT - Tentativas Totais</div>
          </div>
          <div style={metricCardStyle}>
            <div style={metricValueStyle}>{metrics?.detectionRate || 0}%</div>
            <div style={metricLabelStyle}>x - Taxa de Detecção</div>
          </div>
        </div>
      </div>

      {/* Interpretação */}
      <div style={interpretationStyle}>
        <h4>📖 Interpretação da Métrica</h4>
        <div style={interpretationGridStyle}>
          <div style={interpretationItemStyle}>
            <strong>90-100%:</strong> Excelente detecção
          </div>
          <div style={interpretationItemStyle}>
            <strong>70-89%:</strong> Boa detecção
          </div>
          <div style={interpretationItemStyle}>
            <strong>50-69%:</strong> Detecção regular
          </div>
          <div style={interpretationItemStyle}>
            <strong>0-49%:</strong> Detecção insuficiente
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos (similares aos anteriores)
const containerStyle = {
  padding: '20px',
  maxWidth: '1000px',
  margin: '0 auto'
};

const formulaSectionStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginBottom: '20px'
};

const formulaDisplayStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  margin: '15px 0',
  padding: '15px',
  background: '#f8f9fa',
  borderRadius: '8px'
};

const variableStyle = {
  textAlign: 'center',
  padding: '10px'
};

const resultStyle = {
  textAlign: 'center',
  padding: '10px',
  background: '#e8f4fd',
  borderRadius: '5px',
  fontWeight: 'bold'
};

const validationStyle = {
  padding: '10px',
  borderRadius: '5px',
  textAlign: 'center',
  marginTop: '10px'
};

const validationSectionStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginBottom: '20px',
  textAlign: 'center'
};

const validateButtonStyle = {
  padding: '12px 24px',
  background: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  marginBottom: '15px'
};

const resultsStyle = {
  textAlign: 'left'
};

const testResultStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px',
  borderBottom: '1px solid #dee2e6',
  fontSize: '14px'
};

const metricsSectionStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  marginBottom: '20px'
};

const metricsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '15px'
};

const metricCardStyle = {
  textAlign: 'center',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6'
};

const metricValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2c3e50',
  marginBottom: '5px'
};

const metricLabelStyle = {
  fontSize: '12px',
  color: '#6c757d'
};

const interpretationStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const interpretationGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '10px',
  marginTop: '15px'
};

const interpretationItemStyle = {
  padding: '10px',
  background: '#e8f4fd',
  borderRadius: '5px',
  fontSize: '14px'
};

export default SecurityValidationPanel;