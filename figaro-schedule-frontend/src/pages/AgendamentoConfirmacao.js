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

  // ✅ DEBUG: Log inicial - SEM estado que causa rerender
  useEffect(() => {
    console.log('🎯 AgendamentoConfirmacao - Montado');
    console.log('📦 sessionStorage:', {
      agendamentoCompleto: sessionStorage.getItem('agendamentoCompleto'),
      servicoSelecionado: sessionStorage.getItem('servicoSelecionado')
    });
  }, []); // ✅ Array vazio - executa apenas uma vez

  useEffect(() => {
    // ✅ CORREÇÃO: Evita loop infinito
    const agendamentoCompleto = sessionStorage.getItem('agendamentoCompleto');
    const servicoSelecionado = sessionStorage.getItem('servicoSelecionado');
    
    console.log('🔍 Buscando dados do agendamento:', {
      agendamentoCompleto: !!agendamentoCompleto,
      servicoSelecionado: !!servicoSelecionado,
      servicoJaCarregado: !!servico,
      horarioJaCarregado: !!horarioSelecionado
    });

    // Se já temos os dados carregados, não faz nada
    if (servico && horarioSelecionado) {
      console.log('✅ Dados já carregados, evitando rerender');
      return;
    }

    if (!user) {
      setMessage('❌ Você precisa estar logado para confirmar um agendamento.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (user.type !== 'cliente') {
      setMessage('❌ Esta funcionalidade é exclusiva para clientes.');
      setTimeout(() => navigate('/dashboard'), 2000);
      return;
    }

    try {
      // Cenário 1: Temos o agendamento completo (serviço + horário)
      if (agendamentoCompleto) {
        const agendamentoData = JSON.parse(agendamentoCompleto);
        console.log('📦 Dados do agendamento completo:', agendamentoData);
        
        // ✅ VERIFICAÇÃO: Garante que temos todos os dados necessários
        if (agendamentoData.id && agendamentoData.horarioSelecionado) {
          // ✅ Só atualiza se for necessário (evita rerender desnecessário)
          if (!servico || servico.id !== agendamentoData.id) {
            setServico(agendamentoData);
          }
          if (!horarioSelecionado || horarioSelecionado !== agendamentoData.horarioSelecionado) {
            setHorarioSelecionado(agendamentoData.horarioSelecionado);
          }
          setMessage(''); // Limpa mensagens anteriores
        } else {
          throw new Error('Dados do agendamento incompletos');
        }
      }
      // Cenário 2: Temos apenas o serviço (redirecionamento direto)
      else if (servicoSelecionado && !agendamentoCompleto) {
        const servicoData = JSON.parse(servicoSelecionado);
        console.log('📦 Apenas serviço selecionado, redirecionando...', servicoData);
        setMessage('⚠️  Por favor, selecione um horário primeiro.');
        
        // Redireciona para seleção de horário
        setTimeout(() => {
          navigate('/agendamento/horario');
        }, 1500);
      }
      // Cenário 3: Nenhum dado encontrado
      else if (!agendamentoCompleto && !servicoSelecionado) {
        setMessage('❌ Nenhum agendamento encontrado. Por favor, selecione um serviço primeiro.');
        
        // Redireciona para serviços após 3 segundos
        setTimeout(() => {
          navigate('/servicos-cliente');
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar informações do agendamento:', error);
      setMessage('❌ Erro ao carregar informações do agendamento. Por favor, tente novamente.');
      
      // Limpa dados corrompidos
      sessionStorage.removeItem('agendamentoCompleto');
      sessionStorage.removeItem('servicoSelecionado');
    }
  // ✅ CORREÇÃO: Dependências específicas
  }, [user, navigate, servico, horarioSelecionado]);

  const handleConfirmarAgendamento = async () => {
    if (!servico || !user || !horarioSelecionado) {
      setMessage('❌ Dados incompletos. Verifique se selecionou um serviço e horário.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('📝 Confirmando agendamento com dados:', {
        servico: servico.nome,
        horario: horarioSelecionado,
        user: user.email
      });

      const agendamentoData = {
        servico_id: servico.id,
        prestador_id: servico.prestador_id,
        cliente_id: user.id,
        data_agendamento: horarioSelecionado,
        valor_servico: servico.valor,
        observacoes: `Agendamento realizado via sistema - ${new Date().toLocaleString('pt-BR')}`
      };

      console.log('🚀 Enviando para API:', agendamentoData);

      const result = await agendamentoService.createAgendamento(agendamentoData);
      
      console.log('✅ Resposta da API:', result);
      
      if (result.success) {
        setAgendamentoConfirmado(true);
        setMessage('✅ Agendamento confirmado com sucesso!');
        
        // Limpa dados
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
      console.error('❌ Erro ao confirmar agendamento:', error);
      setMessage('❌ Erro ao confirmar agendamento: ' + error.message);
      
      if (error.message.includes('indisponível')) {
        setMessage('❌ ' + error.message + ' Redirecionando para seleção de horário...');
        setTimeout(() => {
          navigate('/agendamento/horario');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoltarParaHorarios = () => {
    if (servico) {
      sessionStorage.setItem('servicoSelecionado', JSON.stringify(servico));
    }
    sessionStorage.removeItem('agendamentoCompleto');
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

  // Renderização condicional
  if (message && !servico && !agendamentoConfirmado) {
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

  if (!servico && !agendamentoConfirmado) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={loadingStyle}>
            <h2>Carregando...</h2>
            <p>Preparando confirmação do agendamento</p>
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
        </div>

        {/* Resumo do Serviço */}
        <div style={resumoStyle}>
          <h3>Resumo do Serviço</h3>
          <div style={resumoItemStyle}>
            <strong>Serviço:</strong> {servico?.nome}
          </div>
          {servico?.prestador_nome && (
            <div style={resumoItemStyle}>
              <strong>Prestador:</strong> {servico.prestador_nome}
            </div>
          )}
          <div style={resumoItemStyle}>
            <strong>Local:</strong> {servico?.local_atendimento}
          </div>
          <div style={resumoItemStyle}>
            <strong>📅 Horário:</strong> {formatarHorario(horarioSelecionado)}
          </div>
          {servico?.valor && (
            <div style={resumoItemStyle}>
              <strong>Valor:</strong> {formatarValor(servico.valor)}
            </div>
          )}
        </div>

        {/* Mensagem de Feedback */}
        {message && (
          <div style={messageStyle(message)}>
            {message}
          </div>
        )}

        {/* Ações */}
        {!agendamentoConfirmado ? (
          <div style={actionsStyle}>
            <button 
              onClick={handleConfirmarAgendamento}
              disabled={loading}
              style={primaryButtonStyle}
            >
              {loading ? '🔄 Confirmando...' : '✅ Confirmar Agendamento'}
            </button>
            <button 
              onClick={handleVoltarParaHorarios}
              style={secondaryButtonStyle}
            >
              ↩️ Alterar Horário
            </button>
            <button 
              onClick={handleCancelar}
              style={tertiaryButtonStyle}
            >
              ❌ Cancelar
            </button>
          </div>
        ) : (
          <div style={successActionsStyle}>
            <p>✅ Agendamento confirmado com sucesso!</p>
            <button 
              onClick={() => navigate('/dashboard')}
              style={primaryButtonStyle}
            >
              Ir para Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos (mantenha os mesmos do código anterior)
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

const actionsStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const successActionsStyle = {
  textAlign: 'center',
  padding: '20px',
  background: '#d4edda',
  borderRadius: '8px'
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

const messageStyle = (message) => ({
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
  background: message.includes('✅') ? '#d4edda' : '#f8d7da',
  color: message.includes('✅') ? '#155724' : '#721c24',
  textAlign: 'center'
});

export default AgendamentoConfirmacao;