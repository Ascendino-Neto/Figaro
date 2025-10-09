import React, { useState } from 'react';
import { clienteService } from '../services/clienteService';
import { authService } from '../services/authService';

const ClienteCadastro = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: ''
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
      
      // Limpa o formul�rio
      setFormData({ nome: '', cpf: '', telefone: '', email: '', senha: '' });
      
    } catch (error) {
      setMessage('Erro: ' + error.message);
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

  // ? NOVO: Fun��es de formata��o
  const formatCpf = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleCpfChange = (e) => {
    const formattedValue = formatCpf(e.target.value);
    setFormData({ ...formData, cpf: formattedValue });
  };

  const handleTelefoneChange = (e) => {
    const formattedValue = formatTelefone(e.target.value);
    setFormData({ ...formData, telefone: formattedValue });
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Cadastro de Cliente</h2>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* ? Nome Completo */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Seu nome completo"
            />
          </div>

          {/* ? CPF com formata��o autom�tica */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>CPF *</label>
            <input
              type="text"
              name="cpf"
              value={formData.cpf}
              onChange={handleCpfChange}
              required
              style={inputStyle}
              placeholder="000.000.000-00"
              maxLength="14"
            />
          </div>

          {/* ? Telefone com formata��o autom�tica */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Telefone *</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              required
              style={inputStyle}
              placeholder="(11) 99999-9999"
              maxLength="15"
            />
          </div>

          {/* ? Email */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>E-mail *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="seu@email.com"
            />
          </div>

          {/* ? Senha */}
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Senha *</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Mínimo 6 caracteres"
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
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </form>

        <div style={footerStyle}>
          <p>Já tem uma conta? <a href="/login" style={linkStyle}>Faça login</a></p>
        </div>
      </div>
    </div>
  );
};

// ? ESTILOS ATUALIZADOS (igual ao prestador)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '80vh',
  padding: '20px'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '500px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '30px',
  fontSize: '24px'
};

const formStyle = {
  width: '100%'
};

const inputGroupStyle = {
  marginBottom: '20px'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: '600',
  color: '#34495e',
  fontSize: '14px'
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #bdc3c7',
  borderRadius: '5px',
  fontSize: '16px',
  transition: 'border-color 0.3s'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '10px'
};

const footerStyle = {
  marginTop: '20px',
  textAlign: 'center',
  paddingTop: '20px',
  borderTop: '1px solid #ecf0f1'
};

const linkStyle = {
  color: '#3498db',
  textDecoration: 'none',
  fontWeight: '600'
};

export default ClienteCadastro;