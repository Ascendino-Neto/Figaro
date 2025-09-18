import React, { useState, useEffect } from 'react';
import ClienteForm from '../components/clientes/ClienteForm';
import ClienteList from '../components/clientes/ClienteList';
import { clienteService } from '../services/clienteService';
import '../styles/Dashboard.css';

const Clientes = () => {
  const [showForm, setShowForm] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await clienteService.getAllClientes();
      setClientes(data);
    } catch (error) {
      setMessage('Erro ao carregar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (successMessage) => {
    setMessage(successMessage);
    setShowForm(false);
    loadClientes();
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
    setMessage('');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Gerenciamento de Clientes</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Novo Cliente
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showForm ? (
        <ClienteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      ) : (
        <>
          {loading ? (
            <div className="loading">Carregando clientes...</div>
          ) : (
            <ClienteList clientes={clientes} onRefresh={loadClientes} />
          )}
        </>
      )}
    </div>
  );
};

export default Clientes;