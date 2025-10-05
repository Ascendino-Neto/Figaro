import React, { useState, useEffect } from 'react';
import { servicoService } from '../services/servicoService';
import ServicoCardCliente from '../components/servicos/ServicoCardCliente';
import { authService } from '../services/authService';

const ServicosCliente = () => {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const response = await servicoService.getAllServicos();
      
      if (response.success) {
        // Filtra apenas serviços ativos
        const servicosAtivos = response.servicos.filter(servico => servico.ativo !== 0);
        setServicos(servicosAtivos);
      } else {
        setError('Erro ao carregar serviços');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const servicosFiltrados = servicos.filter(servico =>
    servico.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    servico.descricao?.toLowerCase().includes(filtro.toLowerCase()) ||
    servico.local_atendimento.toLowerCase().includes(filtro.toLowerCase())
  );

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

      {/* Barra de Pesquisa */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="🔍 Buscar por nome, descrição ou local..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={searchInputStyle}
        />
        <span style={resultsStyle}>
          {servicosFiltrados.length} de {servicos.length} serviços encontrados
        </span>
      </div>

      {/* Lista de Serviços */}
      {servicosFiltrados.length === 0 && !loading ? (
        <div style={emptyStateStyle}>
          <h3>Nenhum serviço encontrado</h3>
          <p>
            {filtro 
              ? 'Tente ajustar os termos da sua busca'
              : 'No momento não há serviços disponíveis'
            }
          </p>
          {filtro && (
            <button 
              onClick={() => setFiltro('')}
              style={clearFilterButtonStyle}
            >
              Limpar Filtro
            </button>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {servicosFiltrados.map(servico => (
            <ServicoCardCliente 
              key={servico.id} 
              servico={servico} 
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

// Estilos
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

const searchContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
  gap: '15px',
  flexWrap: 'wrap'
};

const searchInputStyle = {
  flex: '1',
  minWidth: '300px',
  padding: '12px 16px',
  border: '2px solid #bdc3c7',
  borderRadius: '25px',
  fontSize: '16px',
  outline: 'none',
  transition: 'border-color 0.3s'
};

const resultsStyle = {
  color: '#7f8c8d',
  fontSize: '14px',
  fontWeight: '500'
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