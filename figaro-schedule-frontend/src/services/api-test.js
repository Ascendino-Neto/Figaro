import React, { useState, useEffect } from 'react';

export const ApiTest = () => {
  const [backendStatus, setBackendStatus] = useState('testando...');
  const [dbStatus, setDbStatus] = useState('testando...');
  const [details, setDetails] = useState('');

  useEffect(() => {
    // Testar conex�o com o backend
    fetch('http://localhost:3000/api/health')
      .then(response => response.json())
      .then(data => {
        setBackendStatus('conectado ??');
        // SQLite retorna status diretamente, n�o data.database
        setDbStatus(data.status === 'ok' ? 'conectado ??' : 'offline ?');
        setDetails(`última verificação: ${new Date().toLocaleTimeString()}`);
      })
      .catch(error => {
        setBackendStatus('offline ?');
        setDbStatus('offline ?');
        setDetails('Erro ao conectar com o backend. Verifique se o servidor está rodando na porta 3000.');
      });
  }, []);

  return (
    <div style={{ 
      marginTop: '30px', 
      padding: '20px', 
      background: '#ecf0f1', 
      borderRadius: '5px',
      border: '1px solid #bdc3c7'
    }}>
      <h4>Status do Sistema:</h4>
      <p>Frontend React: <span style={{ color: 'green' }}>?? Funcionando</span></p>
      <p>Backend Node.js: <span style={{ color: backendStatus.includes('??') ? 'green' : 'red' }}>
        {backendStatus}
      </span></p>
      <p>Banco SQLite: <span style={{ color: dbStatus.includes('??') ? 'green' : 'red' }}>
        {dbStatus}
      </span></p>
      
      {details && (
        <p style={{ fontSize: '14px', color: '#7f8c8d', marginTop: '10px' }}>
          {details}
        </p>
      )}
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          style={{
            padding: '8px 15px',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => window.location.reload()}
        >
          Atualizar Status
        </button>
        
        <button 
          style={{
            padding: '8px 15px',
            background: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => window.open('http://localhost:3000/api/health', '_blank')}
        >
          Testar API Diretamente
        </button>
      </div>
    </div>
  );
};