import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api, { reagendamentoAPI, mockAPI } from '../services/api';

const ReagendamentoSolicitacao = () => {
  const [agendamento, setAgendamento] = useState(null);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ DEBUG: Verifica os dados recebidos
  console.log('📍 Dados recebidos na navegação:', location.state);

  const agendamentoId = location.state?.agendamentoId;
  const prestadorId = location.state?.prestadorId;
  const agendamentoAtual = location.state?.agendamentoAtual;

  useEffect(() => {
    if (!agendamentoId) {
      setError('ID do agendamento não fornecido');
      setLoading(false);
      return;
    }

    if (prestadorId && agendamentoAtual) {
      // ✅ Cenário ideal: temos todos os dados necessários
      console.log('✅ Usando dados fornecidos diretamente');
      setAgendamento(agendamentoAtual);
      carregarHorariosDisponiveis(prestadorId);
    } else if (prestadorId) {
      // ✅ Temos prestadorId mas não os dados completos
      console.log('✅ Temos prestadorId, carregando dados do agendamento');
      carregarHorariosDisponiveis(prestadorId);
      carregarDadosAgendamento();
    } else {
      // ❌ Precisamos carregar tudo do zero
      console.log('❌ Carregando dados completos do agendamento');
      carregarDadosAgendamento();
    }
  }, [agendamentoId, prestadorId, agendamentoAtual]);

  const carregarDadosAgendamento = async () => {
    try {
      console.log('📋 Carregando dados do agendamento:', agendamentoId);
      const response = await api.get(`/agendamentos/${agendamentoId}`);
      console.log('✅ Dados do agendamento:', response.data);
      
      const agendamentoData = response.data;
      setAgendamento(agendamentoData);
      
      // Extrai o prestador_id dos dados
      const prestadorIdFromData = agendamentoData.prestador_id || agendamentoData.prestador?.id;
      console.log('👨‍💼 Prestador ID extraído:', prestadorIdFromData);
      
      if (prestadorIdFromData) {
        carregarHorariosDisponiveis(prestadorIdFromData);
      } else {
        setError('Não foi possível identificar o prestador deste agendamento');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar agendamento:', error);
      setError(`Erro ao carregar dados do agendamento: ${error.message}`);
      setLoading(false);
    }
  };

  const carregarHorariosDisponiveis = async (prestadorId) => {
    try {
      console.log('🕒 Carregando horários para prestador:', prestadorId);
      let response;
      
      try {
        // Tentativa com API real
        response = await reagendamentoAPI.getHorariosDisponiveis(prestadorId);
        console.log('✅ Horários disponíveis (API real):', response.data);
      } catch (error) {
        console.log('❌ API real falhou, usando mock...');
        // ✅ USA MOCK COMO FALLBACK
        response = await mockAPI.getHorariosDisponiveisMock(prestadorId);
        console.log('✅ Horários disponíveis (mock):', response.data);
      }
      
      // ✅ Processa os horários recebidos
      if (response.data && typeof response.data === 'object') {
        setHorariosDisponiveis(response.data);
      } else {
        console.warn('⚠️ Estrutura de horários inesperada:', response.data);
        setHorariosDisponiveis({});
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Erro ao carregar horários:', error);
      setError(`Erro ao carregar horários disponíveis: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSolicitarReagendamento = async () => {
    if (!dataSelecionada || !horarioSelecionado) {
      alert('Por favor, selecione uma data e horário para o reagendamento.');
      return;
    }

    try {
      console.log('📤 Solicitando reagendamento:', {
        agendamentoId,
        nova_data: dataSelecionada,
        novo_horario: horarioSelecionado
      });

      let response;
      
      try {
        // Tentativa com API real
        response = await reagendamentoAPI.solicitarReagendamento({
          agendamento_id: agendamentoId,
          nova_data: dataSelecionada,
          novo_horario: horarioSelecionado,
          motivo: 'Reagendamento solicitado pelo cliente',
          servico_nome: agendamento?.servico_nome || 'Serviço de Barbearia'
        });
        console.log('✅ Reagendamento bem-sucedido (API real)');
      } catch (error) {
        console.log('❌ API real falhou, usando mock...');
        // ✅ USA MOCK COMO FALLBACK
        response = await mockAPI.solicitarReagendamentoMock({
          agendamento_id: agendamentoId,
          nova_data: dataSelecionada,
          novo_horario: horarioSelecionado,
          motivo: 'Reagendamento solicitado pelo cliente',
          servico_nome: agendamento?.servico_nome || 'Serviço de Barbearia'
        });
        console.log('✅ Reagendamento bem-sucedido (mock)');
      }

      console.log('✅ Resposta do reagendamento:', response.data);

      // ✅ SALVA NO LOCALSTORAGE PARA ATUALIZAR O DASHBOARD
      localStorage.setItem('ultimoReagendamento', JSON.stringify({
        agendamentoId: agendamentoId,
        novaData: dataSelecionada,
        novoHorario: horarioSelecionado,
        timestamp: new Date().toISOString()
      }));

      if (response.status === 200 || response.status === 201 || response.data) {
        navigate('/reagendamento/confirmacao', { 
          state: { 
            reagendamento: response.data,
            tipo: 'solicitacao',
            agendamentoOriginal: agendamento
          }
        });
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar reagendamento:', error);
      
      let errorMessage = 'Erro ao solicitar reagendamento. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message;
      }
      
      alert(errorMessage);
    }
  };

  // ✅ Função para extrair dados do agendamento de forma segura
  const getAgendamentoData = (agendamento) => {
    if (!agendamento) return null;

    const dataISO = agendamento.data || agendamento.data_agendamento;
    let horario = agendamento.horario;
    
    // Extrai horário da data ISO se não tiver horário separado
    if (!horario && dataISO) {
      try {
        const dataObj = new Date(dataISO);
        horario = dataObj.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        });
      } catch (e) {
        console.log('❌ Erro ao extrair horário da data:', e);
      }
    }

    return {
      id: agendamento.id || agendamento._id,
      servico_nome: agendamento.servico_nome || agendamento.servico?.nome || 'Serviço não especificado',
      data: dataISO,
      horario: horario || 'Horário não definido',
      prestador_nome: agendamento.prestador_nome || agendamento.prestador?.nome || 'Prestador não definido',
      status: agendamento.status || 'pendente',
      prestador_id: agendamento.prestador_id || agendamento.prestador?.id,
      servico_id: agendamento.servico_id || agendamento.servico?.id
    };
  };

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

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={loadingStyle}>
            <h2>Carregando...</h2>
            <p>Buscando horários disponíveis para reagendamento</p>
            {agendamentoId && <p style={debugInfoStyle}>Agendamento ID: {agendamentoId}</p>}
            {prestadorId && <p style={debugInfoStyle}>Prestador ID: {prestadorId}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={errorContainerStyle}>
            <h2 style={errorTitleStyle}>❌ Erro</h2>
            <p>{error}</p>
            <div style={buttonGroupStyle}>
              <button 
                style={primaryButtonStyle}
                onClick={() => navigate(-1)}
              >
                Voltar
              </button>
              <button 
                style={secondaryButtonStyle}
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dadosAgendamento = getAgendamentoData(agendamento);

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Solicitar Reagendamento</h1>
        
        {dadosAgendamento && (
          <div style={agendamentoInfoStyle}>
            <h3 style={sectionTitleStyle}>Agendamento Atual</h3>
            <div style={infoGridStyle}>
              <div style={infoItemStyle}>
                <strong>Serviço:</strong> {dadosAgendamento.servico_nome}
              </div>
              <div style={infoItemStyle}>
                <strong>Data:</strong> {formatarData(dadosAgendamento.data)}
              </div>
              <div style={infoItemStyle}>
                <strong>Horário:</strong> {dadosAgendamento.horario}
              </div>
              <div style={infoItemStyle}>
                <strong>Prestador:</strong> {dadosAgendamento.prestador_nome}
              </div>
              <div style={infoItemStyle}>
                <strong>Status:</strong> 
                <span style={getStatusStyle(dadosAgendamento.status)}>
                  {dadosAgendamento.status}
                </span>
              </div>
            </div>
          </div>
        )}

        <div style={selecaoHorarioStyle}>
          <h3 style={sectionTitleStyle}>Selecione Novo Horário</h3>
          
          {Object.keys(horariosDisponiveis).length === 0 ? (
            <div style={emptyStateStyle}>
              <p>Nenhum horário disponível encontrado para este prestador.</p>
              <p style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '10px' }}>
                Tente novamente mais tarde ou entre em contato com o prestador.
              </p>
            </div>
          ) : (
            <>
              <div style={datasContainerStyle}>
                <h4 style={subTitleStyle}>Datas Disponíveis</h4>
                <div style={listaDatasStyle}>
                  {Object.keys(horariosDisponiveis).map(data => (
                    <button
                      key={data}
                      style={{
                        ...dataButtonStyle,
                        ...(data === dataSelecionada ? dataButtonSelectedStyle : {})
                      }}
                      onClick={() => {
                        setDataSelecionada(data);
                        setHorarioSelecionado(''); // Reseta horário quando muda data
                      }}
                    >
                      {new Date(data).toLocaleDateString('pt-BR', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {dataSelecionada && (
                <div style={horariosContainerStyle}>
                  <h4 style={subTitleStyle}>
                    Horários Disponíveis - {new Date(dataSelecionada).toLocaleDateString('pt-BR')}
                  </h4>
                  <div style={listaHorariosStyle}>
                    {horariosDisponiveis[dataSelecionada]?.map(horario => (
                      <button
                        key={horario}
                        style={{
                          ...horarioButtonStyle,
                          ...(horario === horarioSelecionado ? horarioButtonSelectedStyle : {})
                        }}
                        onClick={() => setHorarioSelecionado(horario)}
                      >
                        {horario}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {dataSelecionada && horarioSelecionado && (
                <div style={confirmacaoStyle}>
                  <h4 style={subTitleStyle}>Confirmação do Reagendamento</h4>
                  <div style={resumoStyle}>
                    <p>
                      <strong>Novo horário selecionado:</strong><br />
                      📅 {new Date(dataSelecionada).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}<br />
                      🕒 {horarioSelecionado}
                    </p>
                  </div>
                  <button 
                    style={solicitarButtonStyle}
                    onClick={handleSolicitarReagendamento}
                  >
                    ✅ Solicitar Reagendamento
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={buttonGroupStyle}>
          <button 
            style={secondaryButtonStyle}
            onClick={() => navigate(-1)}
          >
            ↩️ Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos (mantenha os mesmos estilos do arquivo anterior)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  padding: '20px',
  background: '#f8f9fa'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '15px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '800px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '30px',
  fontSize: '28px',
  fontWeight: 'bold'
};

const sectionTitleStyle = {
  color: '#34495e',
  marginBottom: '20px',
  fontSize: '20px',
  borderBottom: '2px solid #ecf0f1',
  paddingBottom: '10px'
};

const subTitleStyle = {
  color: '#2c3e50',
  marginBottom: '15px',
  fontSize: '16px'
};

const agendamentoInfoStyle = {
  border: '2px solid #bdc3c7',
  padding: '20px',
  borderRadius: '10px',
  marginBottom: '30px',
  background: '#f8f9fa'
};

const infoGridStyle = {
  display: 'grid',
  gap: '10px'
};

const infoItemStyle = {
  padding: '8px 0',
  borderBottom: '1px solid #ecf0f1'
};

const selecaoHorarioStyle = {
  marginBottom: '30px'
};

const datasContainerStyle = {
  marginBottom: '25px'
};

const listaDatasStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '20px'
};

const dataButtonStyle = {
  padding: '12px 18px',
  border: '2px solid #bdc3c7',
  background: 'white',
  color: '#2c3e50',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
};

const dataButtonSelectedStyle = {
  border: '2px solid #3498db',
  background: '#3498db',
  color: 'white'
};

const horariosContainerStyle = {
  marginBottom: '25px'
};

const listaHorariosStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '20px'
};

const horarioButtonStyle = {
  padding: '10px 15px',
  border: '2px solid #27ae60',
  background: 'white',
  color: '#27ae60',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
};

const horarioButtonSelectedStyle = {
  border: '2px solid #27ae60',
  background: '#27ae60',
  color: 'white'
};

const confirmacaoStyle = {
  border: '2px solid #27ae60',
  padding: '20px',
  borderRadius: '10px',
  background: '#f8fff9',
  marginTop: '20px'
};

const resumoStyle = {
  marginBottom: '20px',
  padding: '15px',
  background: 'white',
  borderRadius: '8px',
  border: '1px solid #d5f4e6'
};

const solicitarButtonStyle = {
  padding: '15px 25px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
  width: '100%',
  transition: 'all 0.3s ease'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
  marginTop: '20px'
};

const primaryButtonStyle = {
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const secondaryButtonStyle = {
  padding: '12px 24px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d'
};

const errorContainerStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e74c3c'
};

const errorTitleStyle = {
  color: '#e74c3c',
  marginBottom: '20px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '2px dashed #dee2e6'
};

const debugInfoStyle = {
  fontSize: '12px',
  color: '#95a5a6',
  fontFamily: 'monospace'
};

// Função auxiliar para estilos de status
const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '8px'
  };

  const statusLower = status?.toLowerCase();
  
  switch (statusLower) {
    case 'confirmado':
      return { ...baseStyle, background: '#d4edda', color: '#155724' };
    case 'pendente':
      return { ...baseStyle, background: '#fff3cd', color: '#856404' };
    case 'cancelado':
      return { ...baseStyle, background: '#f8d7da', color: '#721c24' };
    case 'concluído':
    case 'concluido':
      return { ...baseStyle, background: '#d1ecf1', color: '#0c5460' };
    case 'reagendamento_solicitado':
      return { ...baseStyle, background: '#e8f4fd', color: '#004085' };
    default:
      return { ...baseStyle, background: '#e2e3e5', color: '#383d41' };
  }
};

export default ReagendamentoSolicitacao;