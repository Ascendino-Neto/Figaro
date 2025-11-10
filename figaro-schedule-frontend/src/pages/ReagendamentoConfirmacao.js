import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const ReagendamentoConfirmacao = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reagendamento, agendamentoOriginal } = location.state || {};

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data não definida';
    
    try {
      return new Date(dataISO).toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/Sao_Paulo'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '20px',
      background: '#f8f9fa'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '60px',
          color: '#27ae60',
          marginBottom: '20px'
        }}>
          ✅
        </div>
        
        <h1 style={{ color: '#27ae60', marginBottom: '20px' }}>
          Reagendamento Solicitado!
        </h1>
        
        <div style={{
          background: '#f8fff9',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3>Detalhes do Reagendamento:</h3>
          {reagendamento && (
            <>
              <p><strong>Novo Horário:</strong> {formatarData(reagendamento.nova_data)} às {reagendamento.novo_horario}</p>
              <p><strong>Status:</strong> <span style={{ color: '#f39c12', fontWeight: 'bold' }}>Pendente de confirmação</span></p>
              <p><strong>Motivo:</strong> {reagendamento.motivo}</p>
              {reagendamento.message && (
                <p style={{ color: '#27ae60', fontWeight: 'bold' }}>{reagendamento.message}</p>
              )}
            </>
          )}
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#7f8c8d' }}>
            O prestador será notificado e entrará em contato para confirmar o reagendamento.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/dashboard" 
            style={{
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Voltar ao Dashboard
          </Link>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Fazer Outro Reagendamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReagendamentoConfirmacao;