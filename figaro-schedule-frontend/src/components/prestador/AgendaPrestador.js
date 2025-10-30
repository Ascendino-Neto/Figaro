// src/components/prestador/AgendaPrestador.js
import React, { useState, useEffect } from 'react';
import { agendamentoService } from '../../services/agendamentoService';
import { authService } from '../../services/authService';

const AgendaPrestador = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      
      if (!user || user.type !== 'prestador') {
        throw new Error('Acesso permitido apenas para prestadores');
      }

      const response = await agendamentoService.getAgendamentosByPrestador(user.id);
      
      if (response.success) {
        // Ordena por data mais recente primeiro
        const agendamentosOrdenados = response.agendamentos.sort((a, b) => 
          new Date(b.data_agendamento) - new Date(a.data_agendamento)
        );
        setAgendamentos(agendamentosOrdenados);
      } else {
        throw new Error(response.error || 'Erro ao carregar agendamentos');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar agenda:', err);
      setError(err.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatus = async (agendamentoId, novoStatus) => {
    try {
      setError('');
      await agendamentoService.updateStatus(agendamentoId, novoStatus);
      
      // Atualiza a lista local
      setAgendamentos(prev => prev.map(ag => 
        ag.id === agendamentoId 
          ? { ...ag, status: novoStatus }
          : ag
      ));
      
      console.log(`✅ Status atualizado para: ${novoStatus}`);
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      setError('Erro ao atualizar status: ' + err.message);
    }
  };

  // Filtros combinados
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const passaFiltroStatus = filtroStatus === 'todos' || agendamento.status === filtroStatus;
    const passaFiltroData = !filtroData || agendamento.data_agendamento.startsWith(filtroData);
    
    return passaFiltroStatus && passaFiltroData;
  });

  const formatarDataHora = (dataISO) => {
    const data = new Date(dataISO);
    return {
      data: data.toLocaleDateString('pt-BR'),
      hora: data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'long' })
    };
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      agendado: { label: 'Agendado', cor: '#3498db', icone: '⏰' },
      confirmado: { label: 'Confirmado', cor: '#27ae60', icone: '✅' },
      em_andamento: { label: 'Em Andamento', cor: '#f39c12', icone: '🔄' },
      concluido: { label: 'Concluído', cor: '#2ecc71', icone: '🎉' },
      cancelado: { label: 'Cancelado', cor: '#e74c3c', icone: '❌' },
      ausente: { label: 'Ausente', cor: '#95a5a6', icone: '😔' }
    };
    
    return statusConfig[status] || { label: status, cor: '#95a5a6', icone: '❓' };
  };

  const getAcoesPermitidas = (status) => {
    const acoes = {
      agendado: ['confirmado', 'cancelado'],
      confirmado: ['em_andamento', 'cancelado'],
      em_andamento: ['concluido', 'ausente'],
      concluido: [],
      cancelado: [],
      ausente: []
    };
    
    return acoes[status] || [];
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <h2>📅 Carregando Agenda...</h2>
          <p>Buscando seus agendamentos</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>📅 Minha Agenda</h1>
        <p>Gerencie os agendamentos dos seus clientes</p>
      </div>

      {error && (
        <div style={errorStyle}>
          <p>{error}</p>
          <button onClick={carregarAgendamentos} style={retryButtonStyle}>
            🔄 Tentar Novamente
          </button>
        </div>
      )}

      {/* Estatísticas Rápidas */}
      <div style={statsContainerStyle}>
        <div style={statCardStyle}>
          <span style={statNumberStyle}>
            {agendamentos.filter(a => a.status === 'agendado').length}
          </span>
          <span style={statLabelStyle}>⏰ Agendados</span>
        </div>
        <div style={statCardStyle}>
          <span style={statNumberStyle}>
            {agendamentos.filter(a => a.status === 'confirmado').length}
          </span>
          <span style={statLabelStyle}>✅ Confirmados</span>
        </div>
        <div style={statCardStyle}>
          <span style={statNumberStyle}>
            {agendamentos.filter(a => a.status === 'em_andamento').length}
          </span>
          <span style={statLabelStyle}>🔄 Em Andamento</span>
        </div>
        <div style={statCardStyle}>
          <span style={statNumberStyle}>
            {agendamentos.filter(a => a.status === 'concluido').length}
          </span>
          <span style={statLabelStyle}>🎉 Concluídos</span>
        </div>
      </div>

      {/* Filtros */}
      <div style={filtersContainerStyle}>
        <div style={filterGroupStyle}>
          <label style={labelStyle}>Filtrar por Status:</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            style={selectStyle}
          >
            <option value="todos">Todos os Status</option>
            <option value="agendado">⏰ Agendados</option>
            <option value="confirmado">✅ Confirmados</option>
            <option value="em_andamento">🔄 Em Andamento</option>
            <option value="concluido">🎉 Concluídos</option>
            <option value="cancelado">❌ Cancelados</option>
          </select>
        </div>

        <div style={filterGroupStyle}>
          <label style={labelStyle}>Filtrar por Data:</label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={filterGroupStyle}>
          <label style={labelStyle}>&nbsp;</label>
          <button 
            onClick={() => { setFiltroStatus('todos'); setFiltroData(''); }}
            style={clearFiltersButtonStyle}
          >
            🗑️ Limpar Filtros
          </button>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div style={agendamentosContainerStyle}>
        <h3>
          {agendamentosFiltrados.length === 0 
            ? 'Nenhum agendamento encontrado' 
            : `${agendamentosFiltrados.length} agendamento(s) encontrado(s)`
          }
        </h3>

        {agendamentosFiltrados.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>
              {filtroStatus !== 'todos' || filtroData 
                ? 'Nenhum agendamento corresponde aos filtros aplicados'
                : 'Você ainda não possui agendamentos'
              }
            </p>
            {(filtroStatus !== 'todos' || filtroData) && (
              <button 
                onClick={() => { setFiltroStatus('todos'); setFiltroData(''); }}
                style={clearFilterButtonStyle}
              >
                Limpar Filtros
              </button>
            )}
          </div>
        ) : (
          <div style={agendamentosListStyle}>
            {agendamentosFiltrados.map(agendamento => {
              const { data, hora, diaSemana } = formatarDataHora(agendamento.data_agendamento);
              const statusInfo = getStatusInfo(agendamento.status);
              const acoesPermitidas = getAcoesPermitidas(agendamento.status);

              return (
                <div key={agendamento.id} style={agendamentoCardStyle}>
                  <div style={agendamentoHeaderStyle}>
                    <div style={clienteInfoStyle}>
                      <h4 style={clienteNomeStyle}>{agendamento.cliente_nome || 'Cliente'}</h4>
                      <p style={clienteTelefoneStyle}>
                        📞 {agendamento.cliente_telefone || 'Telefone não informado'}
                      </p>
                    </div>
                    <div style={statusBadgeStyle(statusInfo.cor)}>
                      {statusInfo.icone} {statusInfo.label}
                    </div>
                  </div>

                  <div style={agendamentoBodyStyle}>
                    <div style={infoGridStyle}>
                      <div style={infoItemStyle}>
                        <span style={infoLabelStyle}>📋 Serviço:</span>
                        <span>{agendamento.servico_nome}</span>
                      </div>
                      <div style={infoItemStyle}>
                        <span style={infoLabelStyle}>📅 Data:</span>
                        <span>{data} ({diaSemana})</span>
                      </div>
                      <div style={infoItemStyle}>
                        <span style={infoLabelStyle}>⏰ Horário:</span>
                        <span>{hora}</span>
                      </div>
                      {agendamento.observacoes && (
                        <div style={infoItemStyle}>
                          <span style={infoLabelStyle}>💬 Observações:</span>
                          <span>{agendamento.observacoes}</span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    {acoesPermitidas.length > 0 && (
                      <div style={acoesContainerStyle}>
                        <label style={acoesLabelStyle}>Ações:</label>
                        <div style={botoesAcaoStyle}>
                          {acoesPermitidas.map(acao => {
                            const acaoInfo = getStatusInfo(acao);
                            return (
                              <button
                                key={acao}
                                onClick={() => atualizarStatus(agendamento.id, acao)}
                                style={botaoAcaoStyle(acaoInfo.cor)}
                              >
                                {acaoInfo.icone} {acaoInfo.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botão de Atualizar */}
      <div style={refreshContainerStyle}>
        <button 
          onClick={carregarAgendamentos}
          style={refreshButtonStyle}
        >
          🔄 Atualizar Agenda
        </button>
      </div>
    </div>
  );
};

// Estilos
const containerStyle = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '20px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#2c3e50'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#7f8c8d'
};

const errorStyle = {
  background: '#f8d7da',
  color: '#721c24',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
  textAlign: 'center'
};

const statsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '15px',
  marginBottom: '30px'
};

const statCardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  border: '1px solid #e1e8ed'
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
  color: '#7f8c8d'
};

const filtersContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '30px',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6'
};

const filterGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontWeight: '600',
  color: '#2c3e50',
  fontSize: '14px'
};

const selectStyle = {
  padding: '10px 12px',
  border: '2px solid #bdc3c7',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none'
};

const inputStyle = {
  padding: '10px 12px',
  border: '2px solid #bdc3c7',
  borderRadius: '6px',
  fontSize: '14px',
  outline: 'none'
};

const clearFiltersButtonStyle = {
  padding: '10px 15px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const agendamentosContainerStyle = {
  marginBottom: '30px'
};

const agendamentosListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const agendamentoCardStyle = {
  background: 'white',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: '1px solid #e1e8ed',
  transition: 'transform 0.2s'
};

const agendamentoHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '15px',
  flexWrap: 'wrap',
  gap: '10px'
};

const clienteInfoStyle = {
  flex: 1
};

const clienteNomeStyle = {
  margin: '0 0 5px 0',
  color: '#2c3e50',
  fontSize: '18px'
};

const clienteTelefoneStyle = {
  margin: 0,
  color: '#7f8c8d',
  fontSize: '14px'
};

const statusBadgeStyle = (cor) => ({
  background: cor,
  color: 'white',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  whiteSpace: 'nowrap'
});

const agendamentoBodyStyle = {
  borderTop: '1px solid #ecf0f1',
  paddingTop: '15px'
};

const infoGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '15px'
};

const infoItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0'
};

const infoLabelStyle = {
  fontWeight: '600',
  color: '#2c3e50',
  minWidth: '120px'
};

const acoesContainerStyle = {
  borderTop: '1px solid #ecf0f1',
  paddingTop: '15px'
};

const acoesLabelStyle = {
  fontWeight: '600',
  color: '#2c3e50',
  marginBottom: '10px',
  display: 'block'
};

const botoesAcaoStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap'
};

const botaoAcaoStyle = (cor) => ({
  padding: '8px 12px',
  background: cor,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '600'
});

const emptyStateStyle = {
  textAlign: 'center',
  padding: '40px 20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  color: '#7f8c8d'
};

const clearFilterButtonStyle = {
  padding: '8px 16px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

const refreshContainerStyle = {
  textAlign: 'center',
  marginTop: '30px'
};

const refreshButtonStyle = {
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600'
};

const retryButtonStyle = {
  padding: '8px 16px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

export default AgendaPrestador;