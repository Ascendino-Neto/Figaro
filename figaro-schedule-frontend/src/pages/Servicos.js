import React, { useState, useEffect } from 'react';
import ServicoForm from '../components/servicos/ServicoForm';
import ServicoList from '../components/servicos/ServicoList';
import { servicoService } from '../services/servicoService';
import { authService } from '../services/authService';

const Servicos = () => {
  const [servicos, setServicos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServicos();
  }, []);

  const loadServicos = async () => {
    setLoading(true);
    try {
      const data = await servicoService.getServicosByPrestador();
      setServicos(data);
    } catch (error) {
      setMessage('Erro ao carregar serviços: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (successMessage) => {
    setMessage(successMessage);
    setShowForm(false);
    loadServicos();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setMessage('');
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1>Meus Serviços</h1>
        <button 
          onClick={() => setShowForm(true)}
          style={buttonStyle}
        >
          + Novo Serviço
        </button>
      </div>

      {message && (
        <div style={messageStyle(message)}>
          {message}
        </div>
      )}

      {showForm ? (
        <ServicoForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      ) : (
        <ServicoList 
          servicos={servicos} 
          onRefresh={loadServicos}
          loading={loading}
        />
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px'
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px'
};

const messageStyle = (message) => ({
  padding: '10px',
  marginBottom: '20px',
  borderRadius: '5px',
  background: message.includes('✅') ? '#d4edda' : '#f8d7da',
  color: message.includes('✅') ? '#155724' : '#721c24'
});

export default Servicos;