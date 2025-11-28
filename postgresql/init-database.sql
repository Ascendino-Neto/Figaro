-- Script de inicialização do banco PostgreSQL

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de prestadores
CREATE TABLE IF NOT EXISTS prestadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    endereco TEXT,
    telefone VARCHAR(15),
    cep VARCHAR(9),
    email VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    local_atendimento VARCHAR(200) NOT NULL,
    tecnicas_utilizadas TEXT,
    valor DECIMAL(10,2),
    tempo_duracao INTEGER,
    prestador_id INTEGER REFERENCES prestadores(id),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (para login)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    telefone VARCHAR(15),
    tipo VARCHAR(20) CHECK (tipo IN ('cliente', 'prestador', 'admin')),
    cliente_id INTEGER REFERENCES clientes(id),
    prestador_id INTEGER REFERENCES prestadores(id),
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    prestador_id INTEGER REFERENCES prestadores(id),
    servico_id INTEGER REFERENCES servicos(id),
    data_agendamento TIMESTAMP NOT NULL,
    valor_servico DECIMAL(10,2),
    observacoes TEXT,
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'ausente')),
    tempo_duracao INTEGER,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo
INSERT INTO clientes (nome, cpf, telefone, email) VALUES 
('João Silva', '123.456.789-00', '(11) 99999-9999', 'joao@email.com'),
('Maria Santos', '987.654.321-00', '(11) 98888-8888', 'maria@email.com')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO prestadores (nome, cpf, endereco, telefone, cep, email) VALUES 
('Carlos Barbeiro', '111.222.333-44', 'Rua das Flores, 123', '(11) 97777-7777', '01234-567', 'carlos@barber.com'),
('Ana Cabeleireira', '555.666.777-88', 'Av. Principal, 456', '(11) 96666-6666', '04567-890', 'ana@hair.com')
ON CONFLICT (cpf) DO NOTHING;

INSERT INTO servicos (nome, descricao, local_atendimento, tecnicas_utilizadas, valor, tempo_duracao, prestador_id) VALUES 
('Corte de Cabelo', 'Corte moderno e atualizado', 'Barbearia Figaro', 'Tesoura, Máquina', 30.00, 30, 1),
('Barba', 'Aparar e modelar barba', 'Barbearia Figaro', 'Navalha, Tesoura', 20.00, 20, 1),
('Corte Feminino', 'Corte e finalização', 'Salão da Ana', 'Tesoura, Secador', 50.00, 60, 2)
ON CONFLICT DO NOTHING;

INSERT INTO usuarios (email, senha, telefone, tipo, cliente_id, prestador_id) VALUES 
('joao@email.com', '123456', '(11) 99999-9999', 'cliente', 1, NULL),
('carlos@barber.com', '123456', '(11) 97777-7777', 'prestador', NULL, 1),
('admin@figaro.com', 'admin123', NULL, 'admin', NULL, NULL)
ON CONFLICT (email) DO NOTHING;