import React, { useState, useEffect } from 'react';
import { servicoService } from '../services/servicoService';
import { agendamentoService } from '../services/agendamentoService';
import ServicoCardCliente from '../components/servicos/ServicoCardCliente';
import { authService } from '../services/authService';

const ServicosCliente = () => {
  const [servicos, setServicos] = useState([]);
  const [servicosFiltrados, setServicosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroHorario, setFiltroHorario] = useState('');
  const [tiposServico, setTiposServico] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState({});

  useEffect(() => {
    carregarServicos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [servicos, filtroTexto, filtroTipo, filtroHorario]);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const response = await servicoService.getAllServicos();
      
      if (response.success) {
        // Filtra apenas serviços ativos
        const servicosAtivos = response.servicos.filter(servico => servico.ativo !== 0);
        setServicos(servicosAtivos);
        
        // Extrai tipos únicos de serviços
        const tiposUnicos = [...new Set(servicosAtivos.map(servico => servico.nome))];
        setTiposServico(tiposUnicos);
        
        // Carrega horários disponíveis para cada serviço
        await carregarHorariosDisponiveis(servicosAtivos);
      } else {
        setError('Erro ao carregar serviços');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const carregarHorariosDisponiveis = async (servicosLista) => {
    try {
      const horariosMap = {};
      
      // Para cada serviço, busca horários disponíveis para hoje
      for (const servico of servicosLista) {
        try {
          const response = await agendamentoService.getHorariosDisponiveis(
            servico.prestador_id, 
            servico.id, 
            1 // Apenas hoje
          );
          
          if (response.success && response.horarios.length > 0) {
            horariosMap[servico.id] = response.horarios;
          }
        } catch (error) {
          console.warn(`Não foi possível carregar horários para o serviço ${servico.nome}`);
        }
      }
      
      setHorariosDisponiveis(horariosMap);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const aplicarFiltros = () => {
    let servicosFiltrados = servicos;

    // Filtro por texto (nome, descrição, local)
    if (filtroTexto) {
      servicosFiltrados = servicosFiltrados.filter(servico =>
        servico.nome.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        servico.descricao?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        servico.local_atendimento.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    // Filtro por tipo de serviço
    if (filtroTipo) {
      servicosFiltrados = servicosFiltrados.filter(servico =>
        servico.nome === filtroTipo
      );
    }

    // Filtro por horário disponível
    if (filtroHorario) {
      servicosFiltrados = servicosFiltrados.filter(servico =>
        horariosDisponiveis[servico.id] && horariosDisponiveis[servico.id].length > 0
      );
    }

    setServicosFiltrados(servicosFiltrados);
  };

  const limparFiltros = () => {
    setFiltroTexto('');
    setFiltroTipo('');
    setFiltroHorario('');
  };

  const temFiltrosAtivos = filtroTexto || filtroTipo || filtroHorario;

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          <h2>Carregando serviços disponíveis...</h2>
          <p>Buscando os melhores serviços para você</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>📋 Serviços Disponíveis</h1>
        <p>Encontre o serviço perfeito para você</p>
      </div>

      {error && (
        <div style={errorStyle}>
          <p>{error}</p>
          <button onClick={carregarServicos} style={retryButtonStyle}>
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Seção de Filtros */}
      <div style={filtersContainerStyle}>
        <h3>🔍 Filtros</h3>
        
        <div style={filtersGridStyle}>
          {/* Filtro de Texto */}
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Buscar</label>
            <input
              type="text"
              placeholder="Digite nome, descrição ou local..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              style={searchInputStyle}
            />
          </div>

          {/* Filtro por Tipo de Serviço */}
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Tipo de Serviço</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos os serviços</option>
              {tiposServico.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Filtro por Horário Disponível */}
          <div style={filterGroupStyle}>
            <label style={labelStyle}>Disponibilidade</label>
            <select
              value={filtroHorario}
              onChange={(e) => setFiltroHorario(e.target.value)}
              style={selectStyle}
            >
              <option value="">Qualquer horário</option>
              <option value="disponivel">Com horários disponíveis hoje</option>
            </select>
          </div>

          {/* Botão Limpar Filtros */}
          {temFiltrosAtivos && (
            <div style={filterGroupStyle}>
              <label style={labelStyle}>&nbsp;</label>
              <button 
                onClick={limparFiltros}
                style={clearFiltersButtonStyle}
              >
                🗑️ Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* Contador de Resultados */}
        <div style={resultsInfoStyle}>
          <span>
            {servicosFiltrados.length} de {servicos.length} serviços encontrados
            {temFiltrosAtivos && ' (com filtros aplicados)'}
          </span>
        </div>
      </div>

      {/* Lista de Serviços Filtrados */}
      {servicosFiltrados.length === 0 ? (
        <div style={emptyStateStyle}>
          <h3>Nenhum serviço encontrado</h3>
          <p>
            {temFiltrosAtivos 
              ? 'Tente ajustar os filtros ou limpar para ver todos os serviços'
              : 'No momento não há serviços disponíveis'
            }
          </p>
          {temFiltrosAtivos && (
            <button 
              onClick={limparFiltros}
              style={clearFilterButtonStyle}
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {servicosFiltrados.map(servico => (
            <ServicoCardCliente 
              key={servico.id} 
              servico={servico}
              horariosDisponiveis={horariosDisponiveis[servico.id] || []}
            />
          ))}
        </div>
      )}

      {/* Informações para Clientes */}
      <div style={infoSectionStyle}>
        <h3>💡 Como funciona?</h3>
        <div style={stepsStyle}>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>1</span>
            <p>Selecione o serviço desejado</p>
          </div>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>2</span>
            <p>Confirme suas informações</p>
          </div>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>3</span>
            <p>Agende seu horário preferido</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Novos estilos para os filtros
const filtersContainerStyle = {
  background: '#f8f9fa',
  padding: '25px',
  borderRadius: '10px',
  border: '1px solid #dee2e6',
  marginBottom: '30px'
};

const filtersGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '15px'
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
  padding: '12px 16px',
  border: '2px solid #bdc3c7',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s',
  background: 'white'
};

const resultsInfoStyle = {
  textAlign: 'center',
  padding: '10px',
  background: '#e8f4fd',
  borderRadius: '5px',
  color: '#2980b9',
  fontWeight: '500'
};

const clearFiltersButtonStyle = {
  padding: '12px 20px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'background 0.3s'
};

// Mantenha os outros estilos do componente original...
const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '40px',
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

const searchInputStyle = {
  padding: '12px 16px',
  border: '2px solid #bdc3c7',
  borderRadius: '8px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s'
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '25px',
  marginBottom: '40px'
};

const emptyStateStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  background: '#ecf0f1',
  borderRadius: '10px',
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

const retryButtonStyle = {
  padding: '8px 16px',
  background: '#e74c3c',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

const infoSectionStyle = {
  background: '#f8f9fa',
  padding: '30px',
  borderRadius: '10px',
  border: '1px solid #dee2e6'
};

const stepsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  marginTop: '20px'
};

const stepStyle = {
  textAlign: 'center',
  padding: '15px'
};

const stepNumberStyle = {
  display: 'inline-block',
  width: '30px',
  height: '30px',
  background: '#3498db',
  color: 'white',
  borderRadius: '50%',
  lineHeight: '30px',
  marginBottom: '10px',
  fontWeight: 'bold'
};

export default ServicosCliente;