import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const ServicoCardCliente = ({ servico }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleSelecionarServico = () => {
    if (!user) {
      alert('Por favor, faça login para agendar um serviço');
      navigate('/login');
      return;
    }

    if (user.type !== 'cliente') {
      alert('Esta funcionalidade é exclusiva para clientes');
      return;
    }

    // Salva o serviço selecionado no sessionStorage para a próxima página
    sessionStorage.setItem('servicoSelecionado', JSON.stringify(servico));
    
    // Navega para a página de confirmação
    navigate('/agendamento/confirmacao');
  };

  const formatarValor = (valor) => {
    if (!valor) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarDuracao = (minutos) => {
    if (!minutos) return 'A definir';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h${mins}min` : `${horas}h`;
  };

  return (
    <div style={cardStyle}>
      {/* Cabeçalho do Card */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>{servico.nome}</h3>
        {servico.valor && (
          <span style={priceStyle}>{formatarValor(servico.valor)}</span>
        )}
      </div>

      {/* Prestador */}
      {servico.prestador_nome && (
        <div style={prestadorStyle}>
          <strong>👤 Prestador:</strong> {servico.prestador_nome}
        </div>
      )}

      {/* Descrição */}
      {servico.descricao && (
        <p style={descriptionStyle}>{servico.descricao}</p>
      )}

      {/* Detalhes do Serviço */}
      <div style={detailsStyle}>
        <div style={detailItemStyle}>
          <strong>📍 Local:</strong> {servico.local_atendimento}
        </div>

        {servico.tempo_duracao && (
          <div style={detailItemStyle}>
            <strong>⏱️ Duração:</strong> {formatarDuracao(servico.tempo_duracao)}
          </div>
        )}

        {servico.tecnicas_utilizadas && (
          <div style={detailItemStyle}>
            <strong>🔧 Técnicas:</strong> {servico.tecnicas_utilizadas}
          </div>
        )}
      </div>

      {/* Rodapé do Card */}
      <div style={footerStyle}>
        <button 
          onClick={handleSelecionarServico}
          style={buttonStyle}
        >
          ✅ Selecionar Serviço
        </button>
        
        <small style={dateStyle}>
          Disponível desde: {new Date(servico.criado_em).toLocaleDateString('pt-BR')}
        </small>
      </div>
    </div>
  );
};

// Estilos
const cardStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e1e8ed',
  transition: 'transform 0.2s, box-shadow 0.2s',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
  }
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '15px',
  gap: '10px'
};

const titleStyle = {
  margin: '0',
  color: '#2c3e50',
  fontSize: '18px',
  fontWeight: '600',
  flex: '1'
};

const priceStyle = {
  background: '#27ae60',
  color: 'white',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '14px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
};

const prestadorStyle = {
  fontSize: '14px',
  color: '#34495e',
  marginBottom: '10px',
  padding: '5px 0',
  borderBottom: '1px solid #ecf0f1'
};

const descriptionStyle = {
  color: '#7f8c8d',
  fontSize: '14px',
  lineHeight: '1.5',
  marginBottom: '15px',
  flex: '1'
};

const detailsStyle = {
  marginBottom: '20px',
  flex: '1'
};

const detailItemStyle = {
  fontSize: '14px',
  marginBottom: '8px',
  color: '#34495e',
  lineHeight: '1.4'
};

const footerStyle = {
  marginTop: 'auto',
  borderTop: '1px solid #ecf0f1',
  paddingTop: '15px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(135deg, #3498db, #2980b9)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background 0.3s',
  ':hover': {
    background: 'linear-gradient(135deg, #2980b9, #3498db)'
  }
};

const dateStyle = {
  color: '#95a5a6',
  fontSize: '12px',
  textAlign: 'center'
};

// Adiciona hover effect via JavaScript
const cardWithHover = {
  ...cardStyle,
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
  }
};

export default ServicoCardCliente;