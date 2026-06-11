-- =========================================
-- TABELA REGIÃO
-- =========================================

CREATE TABLE Regiao (
    id_regiao SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nivel_perigo VARCHAR(50)
);

-- =========================================
-- TABELA USUÁRIO
-- =========================================

CREATE TABLE Usuario (
    cpf CHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nasc DATE NOT NULL,
    telefone VARCHAR(20),
    id_regiao INTEGER NOT NULL,

    FOREIGN KEY (id_regiao)
        REFERENCES Regiao(id_regiao)
);

-- =========================================
-- TABELA DEPENDENTE
-- =========================================

CREATE TABLE Dependente (
    id_dep SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    parentesco VARCHAR(50),
    cpf_usuario CHAR(11) NOT NULL,

    FOREIGN KEY (cpf_usuario)
        REFERENCES Usuario(cpf)
        ON DELETE CASCADE
);

-- =========================================
-- TABELA CATEGORIA
-- =========================================

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL
);

-- =========================================
-- TABELA ABRIGO
-- =========================================

CREATE TABLE Abrigo (
    id_abrigo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,

    endereco VARCHAR(200) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cep CHAR(8) NOT NULL,

    telefone VARCHAR(20),
    status VARCHAR(30),

    cap_maxima INTEGER NOT NULL,
    vagas_disp INTEGER NOT NULL,

    CONSTRAINT chk_vagas
    CHECK (
        vagas_disp >= 0
        AND vagas_disp <= cap_maxima
    )
);

-- =========================================
-- RELAÇÃO ABRIGO x CATEGORIA
-- =========================================

CREATE TABLE Abrigo_Categoria (
    id_abrigo INTEGER,
    id_categoria INTEGER,

    PRIMARY KEY (id_abrigo, id_categoria),

    FOREIGN KEY (id_abrigo)
        REFERENCES Abrigo(id_abrigo)
        ON DELETE CASCADE,

    FOREIGN KEY (id_categoria)
        REFERENCES Categoria(id_categoria)
        ON DELETE CASCADE
);

-- =========================================
-- TABELA ADMINISTRADOR
-- =========================================

CREATE TABLE Administrador (
    id_admin SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- =========================================
-- RELAÇÃO GERENCIA
-- =========================================

CREATE TABLE Gerencia (
    id_admin INTEGER,
    id_abrigo INTEGER,

    PRIMARY KEY (id_admin, id_abrigo),

    FOREIGN KEY (id_admin)
        REFERENCES Administrador(id_admin)
        ON DELETE CASCADE,

    FOREIGN KEY (id_abrigo)
        REFERENCES Abrigo(id_abrigo)
        ON DELETE CASCADE
);

-- =========================================
-- TABELA TRIAGEM
-- =========================================

CREATE TABLE Triagem (
    id_triagem SERIAL PRIMARY KEY,

    data DATE NOT NULL,
    hora TIME NOT NULL,

    prioridade VARCHAR(30),
    status VARCHAR(30),

    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    cpf_usuario CHAR(11) NOT NULL,
    id_abrigo INTEGER NOT NULL,

    FOREIGN KEY (cpf_usuario)
        REFERENCES Usuario(cpf),

    FOREIGN KEY (id_abrigo)
        REFERENCES Abrigo(id_abrigo)
);

-- =========================================
-- FUNÇÃO PARA REDUZIR VAGAS
-- =========================================

CREATE OR REPLACE FUNCTION atualizar_vagas_abrigo()
RETURNS TRIGGER AS $$
BEGIN

    IF (
        SELECT vagas_disp
        FROM Abrigo
        WHERE id_abrigo = NEW.id_abrigo
    ) <= 0 THEN

        RAISE EXCEPTION
        'Não existem vagas disponíveis neste abrigo.';

    END IF;

    UPDATE Abrigo
    SET vagas_disp = vagas_disp - 1
    WHERE id_abrigo = NEW.id_abrigo;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGER DE REDUÇÃO DE VAGAS
-- =========================================

CREATE TRIGGER trg_atualizar_vagas
AFTER INSERT ON Triagem
FOR EACH ROW
EXECUTE FUNCTION atualizar_vagas_abrigo();

-- =========================================
-- FUNÇÃO PARA DEVOLVER VAGA
-- =========================================

CREATE OR REPLACE FUNCTION devolver_vaga()
RETURNS TRIGGER AS $$
BEGIN

    IF OLD.status IS DISTINCT FROM 'Cancelada'
       AND NEW.status = 'Cancelada'
    THEN

        UPDATE Abrigo
        SET vagas_disp = vagas_disp + 1
        WHERE id_abrigo = NEW.id_abrigo;

    END IF;

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;

-- =========================================
-- TRIGGER DE DEVOLUÇÃO DE VAGAS
-- =========================================

CREATE TRIGGER trg_devolver_vaga
AFTER UPDATE ON Triagem
FOR EACH ROW
EXECUTE FUNCTION devolver_vaga();