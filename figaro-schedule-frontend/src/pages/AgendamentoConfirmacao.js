import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agendamentoService } from '../services/agendamentoService';
import { authService } from '../services/authService';

const AgendamentoConfirmacao = () => {
  const navigate = useNavigate();
  const [servico, setServico] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [agendamentoConfirmado, setAgendamentoConfirmado] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    // ✅ MODIFICADO: Recupera o agendamento completo (serviço + horário)
    const agendamentoCompleto = sessionStorage.getItem('agendamentoCompleto');
    
    if (!agendamentoCompleto) {
      setMessage('❌ Nenhum agendamento encontrado. Por favor, selecione um serviço e horário primeiro.');
      return;
    }

    if (!user || user.type !== 'cliente') {
      setMessage('❌ Esta funcionalidade é exclusiva para clientes.');
      return;
    }

    try {
      const agendamentoData = JSON.parse(agendamentoCompleto);
      setServico(agendamentoData);
      setHorarioSelecionado(agendamentoData.horarioSelecionado);
    } catch (error) {
      setMessage('❌ Erro ao carregar informações do agendamento.');
    }
  }, [user]);

  const handleConfirmarAgendamento = async () => {
    if (!servico || !user || !horarioSelecionado) return;

    setLoading(true);
    setMessage('');

    try {
      // ✅ MODIFICADO: Usa o horário selecionado
      const agendamentoData = {
        servico_id: servico.id,
        prestador_id: servico.prestador_id,
        cliente_id: user.id,
        data_agendamento: horarioSelecionado,
        valor_servico: servico.valor,
        observacoes: `Agendamento realizado via sistema - ${new Date().toLocaleString('pt-BR')}`
      };

      // Valida dados antes do envio
      agendamentoService.validarDadosAgendamento(agendamentoData);

      const result = await agendamentoService.createAgendamento(agendamentoData);
      
      if (result.success) {
        setAgendamentoConfirmado(true);
        setMessage('✅ Agendamento confirmado com sucesso!');
        
        // ✅ MODIFICADO: Limpa os dados do agendamento completo
        sessionStorage.removeItem('agendamentoCompleto');
        sessionStorage.removeItem('servicoSelecionado');
        
        // Redireciona após 3 segundos
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setMessage('❌ ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Erro ao confirmar agendamento: ' + error.message);
      
      // Se o erro for de horário indisponível, oferece voltar para seleção
      if (error.message.includes('não está mais disponível') || error.message.includes('indisponível')) {
        setTimeout(() => {
          navigate('/agendamento/horario');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarParaHorarios = () => {
    navigate('/agendamento/horario');
  };

  const handleCancelar = () => {
    sessionStorage.removeItem('agendamentoCompleto');
    sessionStorage.removeItem('servicoSelecionado');
    navigate('/servicos-cliente');
  };

  const formatarValor = (valor) => {
    if (!valor) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarHorario = (horario) => {
    if (!horario) return 'Não selecionado';
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
          <h1>
            {agendamentoConfirmado ? '🎉 Agendamento Confirmado!' : '📝 Confirmar Agendamento'}
          </h1>
          <p>
            {agendamentoConfirmado 
              ? 'Seu agendamento foi realizado com sucesso!'
              : 'Revise os detalhes antes de confirmar'
            }
          </p>
        </div>

        {/* Resumo do Serviço */}
        <div style={resumoStyle}>
          <h3>Resumo do Serviço</h3>
          
          <div style={resumoItemStyle}>
            <strong>Serviço:</strong> {servico.nome}
          </div>
          
          {servico.prestador_nome && (
            <div style={resumoItemStyle}>
              <strong>Prestador:</strong> {servico.prestador_nome}
            </div>
          )}
          
          <div style={resumoItemStyle}>
            <strong>Local:</strong> {servico.local_atendimento}
          </div>
          
          {/* ✅ NOVO: Horário Selecionado */}
          <div style={resumoItemStyle}>
            <strong>📅 Horário:</strong> {formatarHorario(horarioSelecionado)}
          </div>
          
          {servico.descricao && (
            <div style={resumoItemStyle}>
              <strong>Descrição:</strong> {servico.descricao}
            </div>
          )}
          
          {servico.valor && (
            <div style={resumoItemStyle}>
              <strong>Valor:</strong> {formatarValor(servico.valor)}
            </div>
          )}
          
          {servico.tempo_duracao && (
            <div style={resumoItemStyle}>
              <strong>Duração Estimada:</strong> {servico.tempo_duracao} minutos
            </div>
          )}
        </div>

        {/* Informações do Cliente */}
        <div style={clienteInfoStyle}>
          <h3>Suas Informações</h3>
          <div style={resumoItemStyle}>
            <strong>Cliente:</strong> {user.email}
          </div>
        </div>

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
        {!agendamentoConfirmado && (
          <div style={actionsStyle}>
            <button 
              onClick={handleConfirmarAgendamento}
              disabled={loading}
              style={primaryButtonStyle}
            >
              {loading ? 'Confirmando...' : '✅ Confirmar Agendamento'}
            </button>
            
            {/* ✅ NOVO: Botão para voltar e selecionar outro horário */}
            <button 
              onClick={handleVoltarParaHorarios}
              disabled={loading}
              style={secondaryButtonStyle}
            >
              ↩️ Alterar Horário
            </button>
            
            <button 
              onClick={handleCancelar}
              disabled={loading}
              style={tertiaryButtonStyle}
            >
              ❌ Cancelar
            </button>
          </div>
        )}

        {agendamentoConfirmado && (
          <div style={successActionsStyle}>
            <p>Você será redirecionado automaticamente para o dashboard...</p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={primaryButtonStyle}
            >
              Ir para Dashboard Agora
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos (mantenha os anteriores e adicione)
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
  maxWidth: '600px'
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
  marginBottom: '20px',
  border: '1px solid #dee2e6'
};

const resumoItemStyle = {
  marginBottom: '10px',
  padding: '8px 0',
  borderBottom: '1px solid #ecf0f1',
  fontSize: '15px'
};

const clienteInfoStyle = {
  background: '#e8f4fd',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
  border: '1px solid #b3d9ff'
};

const actionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  justifyContent: 'center'
};

const successActionsStyle = {
  textAlign: 'center',
  padding: '20px'
};

const primaryButtonStyle = {
  padding: '12px 24px',
  background: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
};

const tertiaryButtonStyle = {
  padding: '12px 24px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
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

export default AgendamentoConfirmacao;