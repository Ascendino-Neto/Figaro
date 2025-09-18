import React, { useState } from 'react';
import { clienteService } from '../services/clienteService';

const ClienteCadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await clienteService.createCliente(formData);
      setMessage('? Cliente cadastrado com sucesso!');
      setFormData({ nome: '', cpf: '', telefone: '', email: '' });
    } catch (error) {
      setMessage('? Erro: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      <h2>Cadastro de Cliente</h2>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>Nome Completo:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>CPF:</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="000.000.000-00"
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Telefone:</label>
          <input
            type="tel"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </button>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: message.includes('?') ? '#d4edda' : '#f8d7da',
            color: message.includes('?') ? '#155724' : '#721c24',
            borderRadius: '5px'
          }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

const formStyle = {
  maxWidth: '500px',
  margin: '0 auto',
  padding: '20px',
  background: 'white',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
};

const inputGroupStyle = {
  marginBottom: '15px'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '16px'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default ClienteCadastro;