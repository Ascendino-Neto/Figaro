import React from 'react';

const HorarioCard = ({ 
  horario, 
  formatado, 
  selecionado, 
  onSelecionar,
  duracao 
}) => {
  return (
    <button
      onClick={onSelecionar}
      style={{
        ...cardStyle,
        ...(selecionado ? selectedCardStyle : {})
      }}
      onMouseOver={(e) => {
        if (!selecionado) {
          e.target.style.background = '#e3f2fd';
        }
      }}
      onMouseOut={(e) => {
        if (!selecionado) {
          e.target.style.background = 'white';
        }
      }}
    >
      <div style={timeStyle}>{formatado}</div>
      {duracao && (
        <div style={durationStyle}>{duracao}min</div>
      )}
      {selecionado && (
        <div style={selectedIndicatorStyle}>✓</div>
      )}
    </button>
  );
};

const cardStyle = {
  padding: '15px 10px',
  background: 'white',
  border: '2px solid #3498db',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px'
};

const selectedCardStyle = {
  background: '#3498db',
  color: 'white',
  borderColor: '#2980b9'
};

const timeStyle = {
  fontSize: '16px',
  fontWeight: '600'
};

const durationStyle = {
  fontSize: '12px',
  opacity: 0.8
};

const selectedIndicatorStyle = {
  position: 'absolute',
  top: '5px',
  right: '5px',
  background: '#2ecc71',
  color: 'white',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  fontWeight: 'bold'
};

export default HorarioCard;