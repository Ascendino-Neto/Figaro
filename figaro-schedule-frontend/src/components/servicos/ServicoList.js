import React from 'react';

const ServicoList = ({ servicos, onRefresh, loading }) => {
  if (loading) {
    return (
      <div style={loadingStyle}>
        <p>Carregando serviços...</p>
      </div>
    );
  }

  if (servicos.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <h3>Nenhum serviço cadastrado</h3>
        <p>Comece cadastrando seu primeiro serviço!</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3>Meus Serviços ({servicos.length})</h3>
        <button onClick={onRefresh} style={refreshButtonStyle}>
          🔄 Atualizar
        </button>
      </div>

      <div style={gridStyle}>
        {servicos.map((servico) => (
          <div key={servico.id} style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h4 style={titleStyle}>{servico.nome}</h4>
              {servico.valor && (
                <span style={priceStyle}>R$ {parseFloat(servico.valor).toFixed(2)}</span>
              )}
            </div>

            {servico.descricao && (
              <p style={descriptionStyle}>{servico.descricao}</p>
            )}

            <div style={detailsStyle}>
              <div style={detailItemStyle}>
                <strong>📍 Local:</strong> {servico.local_atendimento}
              </div>

              {servico.tempo_duracao && (
                <div style={detailItemStyle}>
                  <strong>⏱️ Duração:</strong> {servico.tempo_duracao} min
                </div>
              )}

              {servico.tecnicas_utilizadas && (
                <div style={detailItemStyle}>
                  <strong>🔧 Técnicas:</strong> {servico.tecnicas_utilizadas}
                </div>
              )}
            </div>

            <div style={footerStyle}>
              <small style={dateStyle}>
                Cadastrado em: {new Date(servico.criado_em).toLocaleDateString()}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Estilos
const containerStyle = {
  width: '100%'
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
  borderRadius: '10px',
  color: '#7f8c8d'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const refreshButtonStyle = {
  padding: '8px 15px',
  background: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  border: '1px solid #ecf0f1'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '15px'
};

const titleStyle = {
  margin: '0',
  color: '#2c3e50',
  fontSize: '18px'
};

const priceStyle = {
  background: '#27ae60',
  color: 'white',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const descriptionStyle = {
  color: '#7f8c8d',
  fontSize: '14px',
  lineHeight: '1.4',
  marginBottom: '15px'
};

const detailsStyle = {
  marginBottom: '15px'
};

const detailItemStyle = {
  fontSize: '14px',
  marginBottom: '8px',
  color: '#34495e'
};

const footerStyle = {
  borderTop: '1px solid #ecf0f1',
  paddingTop: '15px'
};

const dateStyle = {
  color: '#95a5a6',
  fontSize: '12px'
};

export default ServicoList;