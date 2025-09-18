import React, { useState } from 'react';
import { clienteService } from '../services/clienteService';
import { authService } from '../services/authService';

const ClienteCadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '' // CAMPO NOVO
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Primeiro cadastra o cliente
      const result = await clienteService.createCliente(formData);
      setMessage('? Cliente cadastrado com sucesso!');
      
      // 2. Depois cria o login automaticamente
      try {
        const loginData = {
          email: formData.email,
          senha: formData.senha,
          telefone: formData.telefone
        };
        await authService.login(loginData);
        setMessage('? Cliente cadastrado e login realizado com sucesso!');
      } catch (loginError) {
        setMessage('? Cliente cadastrado, mas erro no login automático: ' + loginError.message);
      }
      
      // Limpa o formulário
      setFormData({ nome: '', cpf: '', telefone: '', email: '', senha: '' });
      
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

        {/* CAMPO NOVO - SENHA */}
        <div style={inputGroupStyle}>
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="Digite uma senha segura"
            minLength="6"
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

// Mantenha os estilos anteriores...
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