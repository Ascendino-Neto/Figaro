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
import ProtectedRoute from './components/common/ProtectedRoute';
import { ApiTest } from './services/api-test';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro/cliente" element={<ClienteCadastro />} />
            <Route path="/cadastro/prestador" element={<PrestadorCadastro />} />
            
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
            
            <Route 
              path="/prestador/dashboard" 
              element={
                <ProtectedRoute requiredType="prestador">
                  <PrestadorDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <ApiTest />
        </main>
      </div>
    </Router>
  );
}

export default App;