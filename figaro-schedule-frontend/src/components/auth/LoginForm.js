import React, { useState } from 'react';
import { authService } from '../../services/authService';
import '../../styles/Form.css';

const LoginForm = ({ onLoginSuccess, onRegisterClick }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    telefone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userType', response.userType);
      onLoginSuccess(response.userType);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleTelefoneChange = (e) => {
    const formattedValue = formatTelefone(e.target.value);
    setFormData({
      ...formData,
      telefone: formattedValue
    });
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="seu@email.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="senha">Senha *</label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefone">Telefone *</label>
          <input
            type="tel"
            id="telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleTelefoneChange}
            required
            maxLength="15"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="form-footer">
          <p>
            Não tem uma conta?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onRegisterClick}
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;