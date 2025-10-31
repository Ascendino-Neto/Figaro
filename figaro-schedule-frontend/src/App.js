import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import ClienteCadastro from './pages/ClienteCadastro';
import PrestadorCadastro from './pages/PrestadorCadastro';
import Dashboard from './pages/Dashboard';
import PrestadorDashboard from './pages/PrestadorDashboard';
import Servicos from './pages/Servicos';
import ServicosCliente from './pages/ServicosCliente'; // ✅ NOVA IMPORT
import AgendamentoConfirmacao from './pages/AgendamentoConfirmacao'; // ✅ NOVA IMPORT
import ProtectedRoute from './components/common/ProtectedRoute';
import { ApiTest } from './services/api-test';
import './App.css';
import SelecaoHorario from './pages/SelecaoHorario';
import EncryptionDashboard from './components/security/EncryptionDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main style={{ 
          padding: '20px', 
          maxWidth: '1200px', 
          margin: '0 auto',
          minHeight: 'calc(100vh - 160px)' // Altura mínima considerando header e padding
        }}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro/cliente" element={<ClienteCadastro />} />
            <Route path="/cadastro/prestador" element={<PrestadorCadastro />} />
            
            {/* ✅ NOVAS ROTAS PÚBLICAS/PROTEGIDAS */}
            
            {/* Serviços para Clientes (acesso público para visualização) */}
            <Route path="/servicos-cliente" element={<ServicosCliente />} />
            
            {/* Rotas Protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/servicos" 
              element={
                <ProtectedRoute requiredType="prestador">
                  <Servicos />
                </ProtectedRoute>
              } 
            />

            <Route path="/encryption-metrics" element={<EncryptionDashboard />} />
            
            <Route 
              path="/prestador/dashboard" 
              element={
                <ProtectedRoute requiredType="prestador">
                  <PrestadorDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/agendamento/horario" 
              element={
                <ProtectedRoute requiredType="cliente">
                  <SelecaoHorario />
                </ProtectedRoute>
              } 
            />
            
            {/* ✅ NOVA ROTA: Confirmação de Agendamento (apenas clientes) */}
            <Route 
              path="/agendamento/confirmacao" 
              element={
                <ProtectedRoute requiredType="cliente">
                  <AgendamentoConfirmacao />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota de fallback para páginas não encontradas */}
            <Route 
              path="*" 
              element={
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#7f8c8d'
                }}>
                  <h2>Página Não Encontrada</h2>
                  <p>A página que você está procurando não existe.</p>
                  <button 
                    onClick={() => window.history.back()}
                    style={{
                      padding: '10px 20px',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      marginTop: '15px'
                    }}
                  >
                    Voltar
                  </button>
                </div>
              } 
            />
          </Routes>
          
          {/* Componente de Teste de API (mantém na maioria das páginas) */}
          <ApiTest />
        </main>
        
        {/* Footer Simples */}
        <footer style={{
          background: '#34495e',
          color: 'white',
          textAlign: 'center',
          padding: '20px',
          marginTop: '40px',
          borderTop: '1px solid #2c3e50'
        }}>
          <p>© 2024 FigaroSchedule - Sistema de Agendamento para Barbearia</p>
          <p style={{ fontSize: '14px', color: '#bdc3c7', marginTop: '5px' }}>
            Desenvolvido com React e Node.js
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;