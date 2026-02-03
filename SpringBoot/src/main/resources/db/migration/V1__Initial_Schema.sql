-- V1__Initial_Schema.sql
-- Criação inicial do schema do banco de dados

-- Tabela de usuários
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email_confirmed BOOLEAN DEFAULT FALSE,
    email_confirmation_token VARCHAR(255),
    email_confirmation_expires TIMESTAMP,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    created_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Tabela de endereços
CREATE TABLE addresses (
    id VARCHAR(36) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(255),
    neighborhood VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(2) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'Brasil',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    place_id VARCHAR(255),
    formatted_address VARCHAR(500),
    is_default BOOLEAN DEFAULT FALSE,
    label VARCHAR(100),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pagamentos
CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    external_id VARCHAR(255),
    preference_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_type VARCHAR(50),
    init_point VARCHAR(500),
    sandbox_init_point VARCHAR(500),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de arquivos
CREATE TABLE files (
    id VARCHAR(36) PRIMARY KEY,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    storage_type VARCHAR(50) NOT NULL,
    uploaded_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_created_by ON products(created_by_id);
CREATE INDEX idx_products_deleted_at ON products(deleted_at);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_external_id ON payments(external_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by_id);
