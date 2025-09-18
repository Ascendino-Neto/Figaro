import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
    // Removido: telefone
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  // Validação básica no frontend
  if (!formData.email || !formData.senha) {
    setMessage('? Por favor, preencha todos os campos');
    setLoading(false);
    return;
  }

  try {
    const result = await authService.login(formData);
    
    if (result.success) {
      setMessage('? Login realizado com sucesso!');
      
      // Redireciona após 1 segundo
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setMessage('? ' + result.error);
    }
    
  } catch (error) {
    setMessage('? ' + error.message);
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
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Login</h2>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>E-mail:</label>
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

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Senha:</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Digite sua senha"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Entrando...' : 'Entrar'}
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
          <p>Não tem uma conta? <a href="/cadastro/cliente" style={linkStyle}>Cadastre-se como cliente</a></p>
        </div>
      </div>
    </div>
  );
};

// Mantenha os estilos (já removi as referências ao telefone)
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh'
};

const cardStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '400px'
};

const titleStyle = {
  textAlign: 'center',
  color: '#2c3e50',
  marginBottom: '30px'
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
  color: '#34495e'
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
  textDecoration: 'none'
};

export default Login;