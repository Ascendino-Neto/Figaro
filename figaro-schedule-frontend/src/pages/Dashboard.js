import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import api, { mockAPI } from '../services/api';
import { agendamentoService } from '../services/agendamentoService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    if (user?.type === 'cliente') {
      carregarAgendamentos();
    } else if (user?.type === 'administrador') {
      carregarEstatisticasAdmin();
    }
  }, [user]);

  // ✅ UseEffect para detectar quando voltar da página de reagendamento
  useEffect(() => {
    const handleStorageChange = () => {
      const reagendamentoData = localStorage.getItem('ultimoReagendamento');
      if (reagendamentoData) {
        try {
          const { agendamentoId, novaData, novoHorario } = JSON.parse(reagendamentoData);
          console.log('🔄 Detectado reagendamento no localStorage:', { agendamentoId, novaData, novoHorario });
          
          // Atualiza o agendamento localmente
          setAgendamentos(prevAgendamentos =>
            prevAgendamentos.map(ag => {
              const agId = ag.id || ag._id;
              if (agId == agendamentoId) {
                console.log('🔄 Atualizando agendamento após reagendamento:', agId);
                return {
                  ...ag,
                  data: novaData,
                  horario: novoHorario,
                  status: 'reagendamento_solicitado'
                };
              }
              return ag;
            })
          );
          
          // Limpa o localStorage após usar
          localStorage.removeItem('ultimoReagendamento');
        } catch (error) {
          console.error('❌ Erro ao processar reagendamento do localStorage:', error);
        }
      }
    };

    // Verifica quando a página é carregada ou quando volta de outra página
    handleStorageChange();

    // Escuta mudanças no storage
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const carregarAgendamentos = async () => {
  try {
    const user = authService.getCurrentUser();
    console.log('🔄 Carregando agendamentos para usuário:', user);

    if (!user) {
      setError('Usuário não está logado');
      setLoading(false);
      return;
    }

    // ✅ TENTATIVA 1: Usar o método específico para meus agendamentos
    console.log('🎯 Tentando carregar meus agendamentos...');
    const response = await agendamentoService.getMeusAgendamentos();
    console.log('✅ Resposta dos agendamentos:', response);

    let agendamentosArray = [];
   
    if (Array.isArray(response.agendamentos)) {
      agendamentosArray = response.agendamentos;
    } else if (response.data && Array.isArray(response.data)) {
      agendamentosArray = response.data;
    } else if (response.agendamentos && typeof response.agendamentos === 'object') {
      agendamentosArray = [response.agendamentos];
    } else {
      console.warn('⚠️ Formato de resposta inesperado:', response);
      agendamentosArray = [];
    }
   
    console.log('📊 Agendamentos processados:', agendamentosArray);
    setAgendamentos(agendamentosArray);
    setError('');
    setLoading(false);
   
  } catch (error) {
    console.error('❌ Erro ao carregar agendamentos:', error);
    
    // ✅ TENTATIVA 2: Fallback para método alternativo
    try {
      console.log('🔄 Tentando método alternativo...');
      const user = authService.getCurrentUser();
      
      if (user && user.type === 'cliente') {
        // Tentar buscar diretamente pela rota do cliente
        const response = await api.get(`/agendamentos/cliente/${user.id}`);
        if (response.data.success) {
          setAgendamentos(response.data.agendamentos || []);
          setError('');
          setLoading(false);
          return;
        }
      }
    } catch (fallbackError) {
      console.error('❌ Fallback também falhou:', fallbackError);
    }
    
    setError(`Erro ao carregar agendamentos: ${error.message}`);
    setAgendamentos([]);
    setLoading(false);
  }
};

  const carregarEstatisticasAdmin = async () => {
    try {
      console.log('📊 Carregando estatísticas para admin');
      
      // Carrega dados mock para o admin (em produção viria da API)
      const response = await mockAPI.getEstatisticasAdmin();
      setEstatisticas(response.data);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
      setError(`Erro ao carregar estatísticas: ${error.message}`);
      setLoading(false);
    }
  };

  // figaro-schedule-frontend\src\pages\Dashboard.js

const handleCancelarAgendamento = async (agendamentoId) => {
  if (!agendamentoId) {
    alert('ID do agendamento inválido');
    return;
  }

  if (window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
    try {
      console.log('🗑️ Tentando cancelar agendamento:', agendamentoId);
     
      const user = authService.getCurrentUser();
      
      // ✅ MUDANÇA: Usar o método correto com cliente_id
      const response = await agendamentoService.cancelarAgendamento(
        agendamentoId, 
        user.id // cliente_id é necessário
      );

      console.log('✅ Cancelamento bem-sucedido:', response);
     
      // ✅ CORREÇÃO: Atualiza o status localmente
      setAgendamentos(prevAgendamentos =>
        prevAgendamentos.map(ag => {
          const agId = ag.id || ag._id;
          if (agId == agendamentoId) {
            console.log('🔄 Atualizando agendamento local:', agId);
            return {
              ...ag,
              status: 'cancelado'
            };
          }
          return ag;
        })
      );
     
      alert('Agendamento cancelado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao cancelar agendamento:', error);
     
      let errorMessage = 'Erro ao cancelar agendamento. ';
      if (error.response?.status === 404) {
        errorMessage += 'Agendamento não encontrado.';
      } else if (error.message.includes('cliente_id')) {
        errorMessage += 'Erro de autenticação.';
      } else {
        errorMessage += error.message;
      }
     
      alert(errorMessage);
    }
  }
};

  const handleReagendar = async (agendamento) => {
    if (!agendamento.id) {
      alert('ID do agendamento inválido');
      return;
    }

    console.log('📅 Iniciando reagendamento para:', agendamento);
    
    // ✅ Verifica se temos os dados necessários
    const dados = getAgendamentoData(agendamento);
    
    if (!dados.prestador_id) {
      alert('Erro: Não foi possível identificar o prestador deste agendamento.');
      return;
    }

    // ✅ Navega para a página de reagendamento com todos os dados necessários
    navigate('/reagendamento/solicitacao', { 
      state: { 
        agendamentoId: agendamento.id,
        prestadorId: dados.prestador_id,
        servicoId: dados.servico_id,
        agendamentoAtual: dados
      } 
    });
  };

  // ✅ Função para extrair dados do agendamento de forma segura
  const getAgendamentoData = (agendamento) => {
    const dataISO = agendamento.data || agendamento.data_agendamento;
    let horario = agendamento.horario;
    
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
      // ✅ Dados críticos para reagendamento
      prestador_id: agendamento.prestador_id || agendamento.prestador?.id,
      servico_id: agendamento.servico_id || agendamento.servico?.id
    };
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'Data não definida';
    
    try {
      return new Date(dataISO).toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  // ✅ Função para obter texto do status
  const getStatusTexto = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'confirmado': 'Confirmado',
      'cancelado': 'Cancelado',
      'concluído': 'Concluído',
      'concluido': 'Concluído',
      'reagendamento_solicitado': 'Reagendamento Solicitado'
    };
    return statusMap[status] || status;
  };

  // Se for administrador, mostra dashboard do admin
  if (user?.type === 'administrador') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>🏢 Dashboard do Administrador</h2>
          
          <div style={welcomeStyle}>
            <h3>Bem-vindo, Administrador {user.email}!</h3>
            <p>Painel de controle completo do sistema FigaroSchedule</p>
            <p style={{ fontSize: '14px', color: '#7f8c8d' }}>ID: {user.id}</p>
          </div>

          {error && (
            <div style={errorAlertStyle}>
              <strong>Erro:</strong> {error}
              <button onClick={carregarEstatisticasAdmin} style={retryButtonStyle}>
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Estatísticas Rápidas */}
          {estatisticas && (
            <div style={estatisticasGridStyle}>
              <div style={estatisticaCardStyle}>
                <div style={estatisticaIconStyle}>👥</div>
                <div style={estatisticaContentStyle}>
                  <h3 style={estatisticaNumeroStyle}>{estatisticas.totalUsuarios}</h3>
                  <p>Total de Usuários</p>
                </div>
              </div>
              
              <div style={{...estatisticaCardStyle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <div style={estatisticaIconStyle}>💼</div>
                <div style={estatisticaContentStyle}>
                  <h3 style={estatisticaNumeroStyle}>{estatisticas.totalPrestadores}</h3>
                  <p>Prestadores</p>
                </div>
              </div>
              
              <div style={{...estatisticaCardStyle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <div style={estatisticaIconStyle}>👨‍💼</div>
                <div style={estatisticaContentStyle}>
                  <h3 style={estatisticaNumeroStyle}>{estatisticas.totalClientes}</h3>
                  <p>Clientes</p>
                </div>
              </div>
              
              <div style={{...estatisticaCardStyle, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <div style={estatisticaIconStyle}>📅</div>
                <div style={estatisticaContentStyle}>
                  <h3 style={estatisticaNumeroStyle}>{estatisticas.agendamentosHoje}</h3>
                  <p>Agendamentos Hoje</p>
                </div>
              </div>
            </div>
          )}

          {/* Funcionalidades do Admin */}
          <div style={featuresGridStyle}>
            <div style={featureCardStyle}>
              <h4>👥 Gerenciar Usuários</h4>
              <p>Visualize e gerencie todos os usuários do sistema</p>
              <Link to="/admin/usuarios" style={featureLinkStyle}>
                Gerenciar Usuários
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>💼 Gerenciar Prestadores</h4>
              <p>Aprove, suspenda ou remova prestadores de serviços</p>
              <Link to="/admin/prestadores" style={featureLinkStyle}>
                Gerenciar Prestadores
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>📊 Relatórios</h4>
              <p>Relatórios detalhados de uso do sistema</p>
              <Link to="/admin/relatorios" style={featureLinkStyle}>
                Ver Relatórios
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>⚙️ Configurações</h4>
              <p>Configurações gerais do sistema</p>
              <Link to="/admin/configuracoes" style={featureLinkStyle}>
                Configurações
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>📋 Todos os Agendamentos</h4>
              <p>Visualize todos os agendamentos do sistema</p>
              <Link to="/admin/agendamentos" style={featureLinkStyle}>
                Ver Agendamentos
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>🔄 Reagendamentos</h4>
              <p>Gerencie solicitações de reagendamento</p>
              <Link to="/admin/reagendamentos" style={featureLinkStyle}>
                Gerenciar Reagendamentos
              </Link>
            </div>
          </div>

          {/* Agendamentos Recentes */}
          <div style={agendamentosSectionStyle}>
            <h3 style={sectionTitleStyle}>📋 Agendamentos Recentes</h3>
            
            {loading ? (
              <div style={loadingStyle}>
                <p>Carregando agendamentos...</p>
              </div>
            ) : estatisticas?.agendamentosRecentes?.length === 0 ? (
              <div style={emptyStateStyle}>
                <p>Nenhum agendamento recente.</p>
              </div>
            ) : (
              <div style={agendamentosListStyle}>
                {estatisticas?.agendamentosRecentes?.map((agendamento, index) => (
                  <div key={index} style={agendamentoCardStyle}>
                    <div style={agendamentoInfoStyle}>
                      <h4 style={servicoTitleStyle}>{agendamento.servico_nome}</h4>
                      <p><strong>Cliente:</strong> {agendamento.cliente_nome}</p>
                      <p><strong>Prestador:</strong> {agendamento.prestador_nome}</p>
                      <p><strong>Data:</strong> {new Date(agendamento.data).toLocaleDateString('pt-BR')}</p>
                      <p><strong>Horário:</strong> {agendamento.horario}</p>
                      <p><strong>Status:</strong> 
                        <span style={getStatusStyle(agendamento.status)}>
                          {agendamento.status}
                        </span>
                      </p>
                    </div>
                    <div style={agendamentoAcoesStyle}>
                      <button style={adminButtonStyle}>
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se for cliente, mostra dashboard do cliente
  if (user?.type === 'cliente') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Dashboard do Cliente</h2>
          
          <div style={welcomeStyle}>
            <h3>Bem-vindo, {user.email}!</h3>
            <p>ID do usuário: {user.id}</p>
            <p>Área exclusiva para clientes da FigaroSchedule</p>
          </div>

          {error && (
            <div style={errorAlertStyle}>
              <strong>Erro:</strong> {error}
              <button onClick={carregarAgendamentos} style={retryButtonStyle}>
                Tentar Novamente
              </button>
            </div>
          )}

          <div style={featuresGridStyle}>
            <div style={featureCardStyle}>
              <h4>Agendar Serviço</h4>
              <p>Agende seu corte de cabelo, barba e outros serviços</p>
              <Link to="/servicos-cliente" style={featureLinkStyle}>
                Fazer Agendamento
              </Link>
            </div>

            <div style={featureCardStyle}>
              <h4>Meus Agendamentos</h4>
              <p>Visualize e gerencie seus agendamentos</p>
              <button 
                style={featureButtonStyle}
                onClick={() => document.getElementById('meus-agendamentos').scrollIntoView({ behavior: 'smooth' })}
              >
                Ver Agendamentos
              </button>
            </div>

            <div style={featureCardStyle}>
              <h4>Meu Perfil</h4>
              <p>Atualize suas informações pessoais</p>
              <button style={featureButtonStyle}>
                Editar Perfil
              </button>
            </div>

            <div style={featureCardStyle}>
              <h4>Serviços Disponíveis</h4>
              <p>Conheça todos os serviços oferecidos</p>
              <Link to="/servicos-cliente" style={featureLinkStyle}>
                Ver Serviços
              </Link>
            </div>
          </div>

          {/* Seção Meus Agendamentos */}
          <div id="meus-agendamentos" style={agendamentosSectionStyle}>
            <h3 style={sectionTitleStyle}>Meus Agendamentos</h3>
            
            {loading ? (
              <div style={loadingStyle}>
                <p>Carregando agendamentos...</p>
              </div>
            ) : error ? (
              <div style={errorStateStyle}>
                <p>❌ {error}</p>
                <button onClick={carregarAgendamentos} style={retryButtonStyle}>
                  Tentar Novamente
                </button>
              </div>
            ) : !agendamentos || agendamentos.length === 0 ? (
              <div style={emptyStateStyle}>
                <p>📝 Nenhum agendamento encontrado.</p>
                <Link to="/servicos-cliente" style={primaryButtonStyle}>
                  Fazer Primeiro Agendamento
                </Link>
              </div>
            ) : (
              <div style={agendamentosListStyle}>
                {agendamentos.map((agendamento, index) => {
                  const dados = getAgendamentoData(agendamento);
                  
                  return (
                    <div key={dados.id || index} style={agendamentoCardStyle}>
                      <div style={agendamentoInfoStyle}>
                        <h4 style={servicoTitleStyle}>{dados.servico_nome}</h4>
                        <p><strong>Data:</strong> {formatarData(dados.data)}</p>
                        <p><strong>Horário:</strong> {dados.horario}</p>
                        <p><strong>Prestador:</strong> {dados.prestador_nome}</p>
                        <p><strong>Status:</strong> 
                          <span style={getStatusStyle(dados.status)}>
                            {getStatusTexto(dados.status)}
                          </span>
                        </p>
                        <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '5px' }}>
                          ID: {dados.id} | Prestador ID: {dados.prestador_id || 'Não disponível'}
                        </p>
                      </div>
                      
                      <div style={agendamentoAcoesStyle}>
                        <button 
                          style={{
                            ...reagendarButtonStyle,
                            ...((dados.status === 'cancelado' || dados.status === 'concluído' || dados.status === 'reagendamento_solicitado') && disabledButtonStyle)
                          }}
                          onClick={() => handleReagendar(agendamento)}
                          disabled={dados.status === 'cancelado' || dados.status === 'concluído' || dados.status === 'reagendamento_solicitado' || !dados.prestador_id}
                        >
                          {dados.status === 'reagendamento_solicitado' ? 'Reagendado' : 'Reagendar'}
                        </button>
                        
                        <button 
                          style={{
                            ...cancelarButtonStyle,
                            ...((dados.status === 'cancelado' || dados.status === 'concluído' || dados.status === 'reagendamento_solicitado') && disabledButtonStyle)
                          }}
                          onClick={() => handleCancelarAgendamento(dados.id)}
                          disabled={dados.status === 'cancelado' || dados.status === 'concluído' || dados.status === 'reagendamento_solicitado'}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Se for prestador, mostra mensagem de erro
  if (user?.type === 'prestador') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={errorStyle}>
            <h3>⚠️ Acesso Restrito</h3>
            <p>Esta área é exclusiva para clientes.</p>
            <p>Você está logado como <strong>prestador</strong>.</p>
            <Link to="/prestador/dashboard" style={primaryButtonStyle}>
              Ir para Dashboard do Prestador
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={loadingStyle}>
          <p>Carregando...</p>
        </div>
      </div>
    </div>
  );
};

// Estilos
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '1200px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '30px'
};

const welcomeStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  padding: '20px',
  background: '#ecf0f1',
  borderRadius: '8px'
};

const errorAlertStyle = {
  background: '#f8d7da',
  color: '#721c24',
  padding: '15px',
  borderRadius: '5px',
  marginBottom: '20px',
  border: '1px solid #f5c6cb'
};

const retryButtonStyle = {
  padding: '5px 10px',
  background: '#dc3545',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer',
  marginLeft: '10px'
};

// Estilos para Admin
const estatisticasGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const estatisticaCardStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
};

const estatisticaIconStyle = {
  fontSize: '2rem'
};

const estatisticaContentStyle = {
  flex: 1
};

const estatisticaNumeroStyle = {
  fontSize: '2rem',
  margin: '0',
  fontWeight: 'bold'
};

const adminButtonStyle = {
  padding: '8px 16px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px'
};

// Estilos compartilhados
const featuresGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '40px'
};

const featureCardStyle = {
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  textAlign: 'center',
  border: '1px solid #dee2e6'
};

const featureButtonStyle = {
  padding: '8px 16px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  fontSize: '14px'
};

const featureLinkStyle = {
  display: 'inline-block',
  padding: '8px 16px',
  background: '#2ecc71',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  fontSize: '14px'
};

const agendamentosSectionStyle = {
  marginTop: '40px',
  paddingTop: '30px',
  borderTop: '2px solid #ecf0f1'
};

const sectionTitleStyle = {
  color: '#2c3e50',
  marginBottom: '20px',
  textAlign: 'center'
};

const agendamentosListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px'
};

const agendamentoCardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fafafa'
};

const agendamentoInfoStyle = {
  flex: 1
};

const servicoTitleStyle = {
  color: '#2c3e50',
  marginBottom: '10px'
};

const agendamentoAcoesStyle = {
  display: 'flex',
  gap: '10px',
  flexDirection: 'column'
};

const reagendarButtonStyle = {
  padding: '8px 16px',
  background: '#f39c12',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px'
};

const cancelarButtonStyle = {
  padding: '8px 16px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px'
};

const disabledButtonStyle = {
  background: '#95a5a6',
  cursor: 'not-allowed'
};

const errorStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#e74c3c'
};

const primaryButtonStyle = {
  display: 'inline-block',
  padding: '12px 24px',
  background: '#3498db',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '5px',
  marginTop: '20px',
  fontSize: '16px'
};

const loadingStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#7f8c8d',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '2px dashed #dee2e6'
};

const errorStateStyle = {
  textAlign: 'center',
  padding: '40px',
  color: '#dc3545',
  background: '#f8d7da',
  borderRadius: '8px'
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

export default Dashboard;