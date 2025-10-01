import React, { useState } from 'react';
import { servicoService } from '../../services/servicoService';

const ServicoForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    local_atendimento: '',
    tecnicas_utilizadas: '',
    valor: '',
    tempo_duracao: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpa erro do campo quando usuário começa a digitar
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do serviço é obrigatório';
    }
    
    if (!formData.local_atendimento.trim()) {
      newErrors.local_atendimento = 'Local de atendimento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await servicoService.createServico(formData);
      onSuccess('✅ Serviço cadastrado com sucesso!');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2>Cadastrar Novo Serviço</h2>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        {/* Nome do Serviço */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Nome do Serviço *
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              style={inputStyle(errors.nome)}
              placeholder="Ex: Corte de Cabelo, Barba, etc."
            />
          </label>
          {errors.nome && <span style={errorStyle}>{errors.nome}</span>}
        </div>

        {/* Descrição */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Descrição
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              style={textAreaStyle}
              placeholder="Descreva detalhadamente o serviço..."
              rows="3"
            />
          </label>
        </div>

        {/* Local de Atendimento */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Local de Atendimento *
            <input
              type="text"
              name="local_atendimento"
              value={formData.local_atendimento}
              onChange={handleChange}
              style={inputStyle(errors.local_atendimento)}
              placeholder="Ex: Barbearia Figaro, Atendimento a domicílio, etc."
            />
          </label>
          {errors.local_atendimento && (
            <span style={errorStyle}>{errors.local_atendimento}</span>
          )}
        </div>

        {/* Técnicas Utilizadas */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>
            Técnicas Utilizadas
            <textarea
              name="tecnicas_utilizadas"
              value={formData.tecnicas_utilizadas}
              onChange={handleChange}
              style={textAreaStyle}
              placeholder="Ex: Tesoura, Máquina, Navalha, etc."
              rows="2"
            />
          </label>
        </div>

        {/* Valor e Duração */}
        <div style={rowStyle}>
          <div style={halfInputStyle}>
            <label style={labelStyle}>
              Valor (R$)
              <input
                type="number"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                style={inputStyle()}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </label>
          </div>
          
          <div style={halfInputStyle}>
            <label style={labelStyle}>
              Tempo de Duração (minutos)
              <input
                type="number"
                name="tempo_duracao"
                value={formData.tempo_duracao}
                onChange={handleChange}
                style={inputStyle()}
                placeholder="30"
                min="1"
              />
            </label>
          </div>
        </div>

        {errors.submit && (
          <div style={submitErrorStyle}>{errors.submit}</div>
        )}

        <div style={buttonsStyle}>
          <button 
            type="submit" 
            disabled={loading}
            style={submitButtonStyle}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Serviço'}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            style={cancelButtonStyle}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

// Estilos
const formContainerStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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

const inputStyle = (error) => ({
  width: '100%',
  padding: '12px',
  border: `2px solid ${error ? '#e74c3c' : '#bdc3c7'}`,
  borderRadius: '5px',
  fontSize: '16px',
  transition: 'border-color 0.3s'
});

const textAreaStyle = {
  width: '100%',
  padding: '12px',
  border: '2px solid #bdc3c7',
  borderRadius: '5px',
  fontSize: '16px',
  resize: 'vertical',
  minHeight: '80px'
};

const errorStyle = {
  color: '#e74c3c',
  fontSize: '14px',
  marginTop: '5px',
  display: 'block'
};

const rowStyle = {
  display: 'flex',
  gap: '15px'
};

const halfInputStyle = {
  flex: 1
};

const submitErrorStyle = {
  background: '#f8d7da',
  color: '#721c24',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '20px',
  textAlign: 'center'
};

const buttonsStyle = {
  display: 'flex',
  gap: '15px',
  marginTop: '30px'
};

const submitButtonStyle = {
  flex: 1,
  padding: '12px',
  background: '#3498db',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer'
};

const cancelButtonStyle = {
  flex: 1,
  padding: '12px',
  background: '#95a5a6',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default ServicoForm;