# WebProjectDemo

> 🚀 Production-ready backend APIs demonstrando boas práticas — o **mesmo projeto** implementado em **NestJS** e **Spring Boot** com **Vertical Slice Architecture**.

---

## 📦 Sobre o Projeto

Este repositório contém **duas implementações** completas do mesmo backend, lado a lado, para fins de estudo, comparação e reutilização como template de novos projetos.

| | [NestJS](./NestJs/) | [Spring Boot](./SpringBoot/) |
|---|---|---|
| **Linguagem** | TypeScript | Java 21 |
| **Framework** | NestJS 10 | Spring Boot 3.5 |
| **Banco de Dados** | PostgreSQL + Prisma ORM | PostgreSQL + Spring Data JPA |
| **Migrações** | Prisma Migrate | Flyway |
| **Autenticação** | JWT (bcrypt + @nestjs/jwt) | JWT (Spring Security + OAuth2 Resource Server) |
| **Validação** | Zod | Jakarta Bean Validation |
| **Documentação API** | Swagger (@nestjs/swagger) | SpringDoc OpenAPI (Swagger UI) |
| **Containers** | Docker Compose | Docker Compose + Dockerfile |

---

## 🎯 Features Compartilhadas

Ambas as implementações oferecem as mesmas funcionalidades:

### 🔐 Autenticação JWT
- Registro e login de usuários
- Confirmação de email
- Senhas hasheadas
- Guards/Filters para rotas protegidas

### 👤 Usuários
- Perfil do usuário autenticado
- Atualização de dados

### 📦 Produtos
- CRUD completo com paginação e filtros
- Soft delete

### 📍 Endereços & Geolocalização
- CRUD de endereços
- Geocoding e reverse geocoding
- Cálculo de distância entre pontos
- Busca por raio e autocomplete
- Integração com **Google Maps API**

### 💳 Pagamentos (MercadoPago)
- Checkout Pro (Preferências de pagamento)
- Webhooks de notificação
- Histórico de pagamentos
- Suporte: Cartão de Crédito, PIX, Boleto

### 📁 Upload de Arquivos
- Upload e download
- Dual storage: **Local** ou **S3/MinIO**
- Presigned URLs (S3)

### 📧 Email
- Envio de emails via **Nodemailer** (NestJS) / **Spring Mail** (Spring Boot)
- Confirmação de conta automática

---

## 🏗️ Arquitetura

Ambos os projetos seguem **Vertical Slice Architecture** (package by feature):

```
src/
├── common/            # Guards, decorators, filters, configs
├── infrastructure/    # Serviços de infra (DB, Storage, Payments, Geo, Mail)
└── features/          # Vertical Slices
    ├── auth/          # Autenticação
    ├── users/         # Usuários
    ├── products/      # Produtos
    ├── addresses/     # Endereços + Geolocalização
    ├── payments/      # Pagamentos + Webhooks
    └── files/         # Upload de arquivos
```

Cada feature contém DTOs, Controller, Service e Module — totalmente independente.

---

## 🚀 Quick Start

### Pré-requisitos Comuns

- Docker & Docker Compose
- Git

### NestJS

```bash
cd NestJs
cp .env.example .env
npm install
docker-compose up -d
npm run prisma:migrate
npm run prisma:generate
npm run start:dev
```

> **Acesso**: http://localhost:3000

### Spring Boot

```bash
cd SpringBoot
cp .env.example .env
docker-compose up -d postgres minio
./mvnw spring-boot:run
```

> **Acesso**: http://localhost:3000  
> **Swagger UI**: http://localhost:3000/api/swagger-ui.html

---

## 🔑 Credenciais Externas

| Serviço | Como Obter |
|---------|------------|
| **Google Maps API** | [Google Cloud Console](https://console.cloud.google.com) — habilitar Geocoding, Distance Matrix, Places |
| **MercadoPago** | [MercadoPago Developers](https://www.mercadopago.com.br/developers) — copiar Access Token de teste |

---

## 📋 Endpoints Principais

Todos sob o prefixo `/api`:

| Recurso | Endpoints | Auth |
|---------|-----------|------|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `GET /auth/confirm-email` | — |
| **Users** | `GET /users/me`, `PATCH /users/me` | 🔒 |
| **Products** | `GET /products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id` | 🔒* |
| **Addresses** | `GET /addresses`, `POST /addresses`, `POST /addresses/calculate-distance` | 🔒 |
| **Payments** | `POST /payments/create-preference`, `GET /payments/user/history` | 🔒 |
| **Files** | `POST /files/upload`, `GET /files/:id/download`, `DELETE /files/:id` | 🔒 |

🔒 = Requer JWT &nbsp;&nbsp; 🔒* = Escrita requer JWT, leitura é pública

---

## 🐳 Docker

Ambos os projetos usam Docker Compose para subir PostgreSQL e MinIO:

```bash
# NestJS
cd NestJs && docker-compose up -d

# Spring Boot
cd SpringBoot && docker-compose up -d
```

---

## 🧪 Testes

```bash
# NestJS
npm run test          # unitários
npm run test:e2e      # e2e
npm run test:cov      # cobertura

# Spring Boot
./mvnw test                  # unitários
./mvnw test jacoco:report    # cobertura
```

---

## 🔄 Comparação das Stacks

| Aspecto | NestJS | Spring Boot |
|---------|--------|-------------|
| **ORM** | Prisma | Spring Data JPA |
| **Migrações** | Prisma Migrate | Flyway |
| **Validação** | Zod | Jakarta Validation |
| **Autenticação** | @nestjs/jwt + Passport | Spring Security + OAuth2 Resource Server |
| **API Docs** | @nestjs/swagger | SpringDoc OpenAPI |
| **DI** | Built-in (NestJS modules) | Spring IoC Container |
| **Utils** | — | Lombok + MapStruct |
| **Monitoramento** | Health check manual | Spring Actuator |
| **CI/CD** | GitHub Actions + GitLab CI | — |
| **Testes** | Jest + Supertest | JUnit 5 + Testcontainers |

---

## 📚 Documentação Adicional

O projeto NestJS inclui guias detalhados em [`NestJs/docs/`](./NestJs/docs/):

- 📖 [Índice da Documentação](./NestJs/docs/README.md)
- 🔐 [Autenticação JWT](./NestJs/docs/AUTENTICACAO_JWT.md)
- 📍 [Geolocalização](./NestJs/docs/GEOLOCALIZACAO.md)
- 💳 [Testar Pagamentos](./NestJs/docs/TESTAR_METODOS_PAGAMENTO.md)
- 🪣 [Configurar MinIO](./NestJs/docs/MINIO.md)
- 🚀 [Guia de Instalação](./NestJs/docs/INSTALACAO.md)

---

## 📄 Licença

MIT

---

**Desenvolvido com:** NestJS • Spring Boot • TypeScript • Java • Prisma • JPA • PostgreSQL • Docker
