import React from 'react';
import HorarioCard from './HorarioCard';

const CalendarioHorarios = ({ 
  horarios, 
  horarioSelecionado, 
  onSelecionarHorario,
  duracaoServico 
}) => {
  // Agrupar horários por data
  const horariosPorData = horarios.reduce((acc, horario) => {
    const data = new Date(horario).toLocaleDateString('pt-BR');
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(horario);
    return acc;
  }, {});

  const formatarData = (dataStr) => {
    const data = new Date(dataStr.split('/').reverse().join('-'));
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
  };

  const formatarHora = (horario) => {
    return new Date(horario).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={containerStyle}>
      {Object.entries(horariosPorData).map(([data, horariosDoDia]) => (
        <div key={data} style={diaContainerStyle}>
          <h4 style={dataHeaderStyle}>
            {formatarData(data)}
          </h4>
          
          <div style={horariosGridStyle}>
            {horariosDoDia.map((horario, index) => (
              <HorarioCard
                key={index}
                horario={horario}
                formatado={formatarHora(horario)}
                selecionado={horarioSelecionado === horario}
                onSelecionar={() => onSelecionarHorario(horario)}
                duracao={duracaoServico}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const containerStyle = {
  width: '100%'
};

const diaContainerStyle = {
  marginBottom: '30px',
  padding: '20px',
  background: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #dee2e6'
};

const dataHeaderStyle = {
  margin: '0 0 15px 0',
  color: '#2c3e50',
  fontSize: '18px',
  fontWeight: '600'
};

const horariosGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '10px'
};

export default CalendarioHorarios;