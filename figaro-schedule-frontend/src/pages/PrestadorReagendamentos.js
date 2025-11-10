import React, { useState, useEffect } from 'react';
import { reagendamentoAPI } from '../services/api'; // ✅ Corrigido

const PrestadorReagendamentos = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = async () => {
    try {
      const response = await reagendamentoAPI.getSolicitacoesReagendamento(); // ✅ Usando reagendamentoAPI
      setSolicitacoes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
      setLoading(false);
    }
  };

  const handleAcaoReagendamento = async (solicitacaoId, acao) => {
    try {
      if (acao === 'confirmar') {
        await reagendamentoAPI.confirmarReagendamento(solicitacaoId);
      } else {
        await reagendamentoAPI.recusarReagendamento(solicitacaoId);
      }
      
      carregarSolicitacoes(); // Recarrega a lista
      alert(`Reagendamento ${acao === 'confirmar' ? 'confirmado' : 'recusado'} com sucesso!`);
    } catch (error) {
      console.error(`Erro ao ${acao} reagendamento:`, error);
      alert(`Erro ao ${acao} reagendamento. Tente novamente.`);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando solicitações...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Solicitações de Reagendamento</h1>
      
      {solicitacoes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          border: '1px dashed #ddd',
          borderRadius: '5px'
        }}>
          <p>Nenhuma solicitação de reagendamento pendente.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {solicitacoes.map(solicitacao => (
            <div key={solicitacao.id} style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <h3>Cliente: {solicitacao.cliente_nome}</h3>
                <p><strong>Serviço:</strong> {solicitacao.servico_nome}</p>
                <p><strong>Data Atual:</strong> {new Date(solicitacao.data_anterior).toLocaleDateString()} às {solicitacao.horario_anterior}</p>
                <p><strong>Nova Data Solicitada:</strong> {new Date(solicitacao.nova_data).toLocaleDateString()} às {solicitacao.novo_horario}</p>
                <p><strong>Motivo:</strong> {solicitacao.motivo}</p>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  style={{
                    padding: '8px 16px',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleAcaoReagendamento(solicitacao.id, 'confirmar')}
                >
                  Confirmar
                </button>
                <button 
                  style={{
                    padding: '8px 16px',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleAcaoReagendamento(solicitacao.id, 'recusar')}
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrestadorReagendamentos;