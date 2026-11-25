-- Execute este script conectado ao banco freelink_db no PostgreSQL
-- Exemplo: createdb -U postgres freelink_db && psql -U postgres -d freelink_db -f freelink_db.sql

CREATE TABLE IF NOT EXISTS LOCALIZACAO (
    id_localizacao SERIAL PRIMARY KEY,
    estado CHAR(2) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep CHAR(8) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6)
);

CREATE TABLE IF NOT EXISTS USUARIO (
    id_usuario SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255), -- Senha pode ser nula para contas Google
    telefone CHAR(11),
    cpf CHAR(11) UNIQUE,
    data_nasc DATE,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('CLIENTE', 'FREELANCER')),
    avaliacao_media DECIMAL(3,2) DEFAULT 0.00,
    foto_perfil VARCHAR(255),
    biografia TEXT,
    link_portfolio VARCHAR(255),
    perfil_json TEXT,
    id_localizacao INT REFERENCES LOCALIZACAO(id_localizacao)
);

COMMENT ON COLUMN USUARIO.biografia IS 'Resumo profissional do freelancer';
COMMENT ON COLUMN USUARIO.link_portfolio IS 'Link para LinkedIn, GitHub ou Behance';

CREATE TABLE IF NOT EXISTS SERVICO (
    id_servico SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    categoria VARCHAR(100),
    valor_sugerido DECIMAL(10,2),
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario)
);

CREATE TABLE IF NOT EXISTS PROPOSTA (
    id_proposta SERIAL PRIMARY KEY,
    valor_proposto DECIMAL(10,2) NOT NULL,
    descricao TEXT,
    data_proposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    id_servico INT NOT NULL REFERENCES SERVICO(id_servico),
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario)
);

CREATE TABLE IF NOT EXISTS MENSAGEM (
    id_mensagem SERIAL PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario),
    id_proposta INT NOT NULL REFERENCES PROPOSTA(id_proposta)
);

CREATE TABLE IF NOT EXISTS CONTRATO (
    id_contrato SERIAL PRIMARY KEY,
    data_inicio DATE,
    data_fim DATE,
    valor_final DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    id_servico INT NOT NULL REFERENCES SERVICO(id_servico),
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario)
);

CREATE TABLE IF NOT EXISTS AVALIACAO (
    id_avaliacao SERIAL PRIMARY KEY,
    nota SMALLINT NOT NULL,
    comentario TEXT,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT NOT NULL REFERENCES USUARIO(id_usuario),
    id_contrato INT NOT NULL REFERENCES CONTRATO(id_contrato)
);

CREATE TABLE IF NOT EXISTS PAGAMENTO (
    id_pagamento SERIAL PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL,
    data_pagamento TIMESTAMP,
    forma_pagamento VARCHAR(50),
    status VARCHAR(20) DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO')),
    id_contrato INT NOT NULL REFERENCES CONTRATO(id_contrato)
);

-- Função e triggers para atualizar automaticamente a coluna atualizado_em (equivalente ao ON UPDATE CURRENT_TIMESTAMP do MySQL)
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS PLATAFORMA_PROJETO (
    id VARCHAR(80) PRIMARY KEY,
    dados_json TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_plataforma_projeto_atualizado_em ON PLATAFORMA_PROJETO;
CREATE TRIGGER trg_plataforma_projeto_atualizado_em
    BEFORE UPDATE ON PLATAFORMA_PROJETO
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TABLE IF NOT EXISTS CHAT_SALA (
    id_sala VARCHAR(120) PRIMARY KEY,
    titulo VARCHAR(200),
    projeto_id VARCHAR(80),
    proposta_id VARCHAR(80),
    participante1_email VARCHAR(150),
    participante1_nome VARCHAR(150),
    participante2_email VARCHAR(150),
    participante2_nome VARCHAR(150),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS trg_chat_sala_atualizado_em ON CHAT_SALA;
CREATE TRIGGER trg_chat_sala_atualizado_em
    BEFORE UPDATE ON CHAT_SALA
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TABLE IF NOT EXISTS CHAT_MENSAGEM (
    id_mensagem SERIAL PRIMARY KEY,
    id_sala VARCHAR(120) NOT NULL,
    remetente_id VARCHAR(80),
    remetente_email VARCHAR(150),
    remetente_nome VARCHAR(150) NOT NULL,
    conteudo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sala ON CHAT_MENSAGEM (id_sala, id_mensagem);
