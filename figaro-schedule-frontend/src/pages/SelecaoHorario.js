import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import { authService } from '../services/authService';
import CalendarioHorarios from '../components/calendario/CalendarioHorarios';

const SelecaoHorario = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Recupera o serviço selecionado
    const servicoSelecionado = sessionStorage.getItem('servicoSelecionado');
    
    if (!servicoSelecionado) {
      setMessage('❌ Nenhum serviço selecionado. Por favor, selecione um serviço primeiro.');
      return;
    }

    try {
      const servicoData = JSON.parse(servicoSelecionado);
      setServico(servicoData);
      carregarHorariosDisponiveis(servicoData);
    } catch (error) {
      setMessage('❌ Erro ao carregar informações do serviço.');
    }
  }, []);

  const carregarHorariosDisponiveis = async (servicoData) => {
    setLoading(true);
    try {
      // Buscar horários disponíveis para os próximos 7 dias
      const response = await agendamentoService.getHorariosDisponiveis(
        servicoData.prestador_id,
        servicoData.id
      );
      
      if (response.success) {
        setHorariosDisponiveis(response.horarios);
      } else {
        setMessage('❌ Erro ao carregar horários disponíveis: ' + response.error);
      }
    } catch (error) {
      setMessage('❌ Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarHorario = (horario) => {
    setHorarioSelecionado(horario);
    setMessage(`✅ Horário selecionado: ${formatarHorario(horario)}`);
  };

  const handleConfirmar = () => {
    if (!horarioSelecionado) {
      setMessage('❌ Por favor, selecione um horário antes de confirmar.');
      return;
    }

    // Salva o horário selecionado junto com o serviço
    const agendamentoCompleto = {
      ...servico,
      horarioSelecionado: horarioSelecionado
    };
    
    sessionStorage.setItem('agendamentoCompleto', JSON.stringify(agendamentoCompleto));
    navigate('/agendamento/confirmacao');
  };

  const handleVoltar = () => {
    navigate('/servicos-cliente');
  };

  const formatarHorario = (horario) => {
    return new Date(horario).toLocaleString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (message && !servico) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={errorStyle}>
            <h2>Ops! Algo deu errado</h2>
            <p>{message}</p>
            <button 
              onClick={() => navigate('/servicos-cliente')}
              style={primaryButtonStyle}
            >
              Voltar para Serviços
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!servico) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={loadingStyle}>
            <h2>Carregando...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1>🕐 Selecionar Horário</h1>
          <p>Escolha um horário disponível para o serviço selecionado</p>
        </div>

        {/* Resumo do Serviço */}
        <div style={resumoStyle}>
          <h3>Serviço Selecionado</h3>
          <div style={servicoInfoStyle}>
            <strong>{servico.nome}</strong>
            <span>com {servico.prestador_nome}</span>
            {servico.tempo_duracao && (
              <span>Duração: {servico.tempo_duracao} minutos</span>
            )}
          </div>
        </div>

        {/* Calendário de Horários */}
        <div style={calendarioSectionStyle}>
          <h3>Horários Disponíveis</h3>
          
          {loading ? (
            <div style={loadingStyle}>
              <p>Carregando horários disponíveis...</p>
            </div>
          ) : horariosDisponiveis.length === 0 ? (
            <div style={emptyStateStyle}>
              <p>Não há horários disponíveis para os próximos dias.</p>
              <button 
                onClick={() => carregarHorariosDisponiveis(servico)}
                style={secondaryButtonStyle}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <CalendarioHorarios
              horarios={horariosDisponiveis}
              horarioSelecionado={horarioSelecionado}
              onSelecionarHorario={handleSelecionarHorario}
              duracaoServico={servico.tempo_duracao || 60}
            />
          )}
        </div>

        {/* Horário Selecionado */}
        {horarioSelecionado && (
          <div style={horarioSelecionadoStyle}>
            <h4>✅ Horário Selecionado</h4>
            <p>{formatarHorario(horarioSelecionado)}</p>
          </div>
        )}

        {/* Mensagem de Feedback */}
        {message && (
          <div style={{
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Ações */}
        <div style={actionsStyle}>
          <button 
            onClick={handleConfirmar}
            disabled={!horarioSelecionado || loading}
            style={{
              ...primaryButtonStyle,
              opacity: !horarioSelecionado ? 0.6 : 1
            }}
          >
            ✅ Confirmar Horário
          </button>
          
          <button 
            onClick={handleVoltar}
            style={secondaryButtonStyle}
          >
            ↩️ Voltar para Serviços
          </button>
        </div>
      </div>
    </div>
  );
};

// Estilos (mantenha os estilos similares aos anteriores)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '800px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  color: '#2c3e50'
};

const resumoStyle = {
  background: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '30px',
  border: '1px solid #dee2e6'
};

const servicoInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '5px'
};

const calendarioSectionStyle = {
  marginBottom: '30px'
};

const horarioSelecionadoStyle = {
  background: '#e8f4fd',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  border: '1px solid #b3d9ff',
  textAlign: 'center'
};

const actionsStyle = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'center',
  flexWrap: 'wrap'
};

const primaryButtonStyle = {
  padding: '12px 24px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  minWidth: '200px'
};

const secondaryButtonStyle = {
  padding: '12px 24px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  minWidth: '200px'
};

const errorStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e74c3c'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '40px',
  background: '#ecf0f1',
  borderRadius: '8px',
  color: '#7f8c8d'
};

export default SelecaoHorario;