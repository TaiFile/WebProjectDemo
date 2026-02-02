# Backend Demo NestJS

Backend production-ready demonstrando boas práticas com **NestJS + TypeScript** usando **Vertical Slice Architecture**.

## 🚀 Stack

- **NestJS** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **Keycloak** (OAuth2/OIDC Authentication)
- **MercadoPago** (Pagamentos)
- **Storage**: Local (pasta) + AWS S3
- **Docker**: PostgreSQL e Keycloak

## 📁 Estrutura de Pastas

```
src/
├── common/              # Guards, decorators, filters
├── infrastructure/      # Prisma, Keycloak, Storage, MercadoPago
│   ├── database/
│   ├── keycloak/
│   ├── storage/        # Interface + Local + S3
│   └── payments/
├── features/           # Vertical Slices
│   ├── users/
│   ├── products/
│   ├── payments/
│   └── files/
└── main.ts
```

## 🎯 Features

### 1. Users
- `GET /users/me` - Perfil do usuário autenticado
- `PATCH /users/me` - Atualizar perfil
- JWT Guard em todas as rotas

### 2. Products
- CRUD completo
- Paginação e filtros
- Soft delete
- Relacionamento com usuário criador

### 3. Payments
- `POST /payments/create-preference` - Criar preferência MercadoPago
- `POST /webhooks/mercadopago` - Webhook de confirmação
- `GET /payments/user/history` - Histórico de pagamentos
- Transações salvas no Prisma

### 4. Files
- `POST /files/upload` - Upload (local ou S3)
- `GET /files/:id/download` - Download de arquivo
- `GET /files/:id/url` - Presigned URL (S3)
- `DELETE /files/:id` - Remover arquivo
- Metadados no Prisma

## 🛠️ Setup

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Subir containers Docker
docker-compose up -d

# Configurar .env (copiar .env.example)
cp .env.example .env

# Rodar migrations do Prisma
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate

# Iniciar aplicação
npm run start:dev
```

### Configurar Keycloak

1. Acessar http://localhost:8080
2. Login: `admin` / `admin`
3. Criar realm: `demo-realm`
4. Criar client: `demo-client`
5. Configurar client como `public` e habilitar Direct Access Grants
6. Criar usuário de teste

## 🌍 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://demo_user:demo_pass@localhost:5432/demo_db

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=demo-realm
KEYCLOAK_CLIENT_ID=demo-client
KEYCLOAK_CLIENT_SECRET=

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_access_token

# Storage
STORAGE_TYPE=local  # ou 's3'
UPLOAD_PATH=./uploads

# AWS S3 (se STORAGE_TYPE=s3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# App
PORT=3000
NODE_ENV=development
```

## 📚 Documentação API

Swagger disponível em: http://localhost:3000/api

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🐳 Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 🏗️ Arquitetura

### Vertical Slice Architecture

Cada feature é um "slice" vertical contendo todas as camadas necessárias:

```
feature-name/
├── dtos/
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *-response.dto.ts
├── *.controller.ts      # HTTP Routes
├── *.service.ts         # Business Logic
└── *.module.ts          # Module Registration
```

### Infrastructure

Camada de infraestrutura com abstrações:

- **Database**: Prisma Client
- **Keycloak**: Auth service
- **Storage**: Interface + Local + S3 implementations
- **Payments**: MercadoPago integration

### Common

Recursos compartilhados:

- **Guards**: JwtAuthGuard, RolesGuard
- **Decorators**: @CurrentUser(), @Roles()
- **Filters**: Exception filters globais
- **Interceptors**: Logging, transformação

## 📦 Scripts Úteis

```bash
npm run start:dev          # Desenvolvimento
npm run build              # Build produção
npm run start:prod         # Produção
npm run prisma:studio      # Prisma Studio (GUI)
npm run lint               # Linter
npm run format             # Formatar código
```

## 🎓 Boas Práticas Implementadas

✅ Validação com class-validator  
✅ Documentação Swagger  
✅ Guards JWT e RBAC  
✅ Decorators customizados  
✅ Logging estruturado  
✅ Exception filters globais  
✅ Health checks  
✅ Dual storage strategy (Local/S3)  
✅ Soft deletes  
✅ Paginação  
✅ Environment configuration  

## 📄 Licença

MIT

---

**Objetivo**: Backend production-ready demonstrando boas práticas, pronto para clonar e iniciar novos projetos.


**To Do**: 
- Fazer a parte de categoria
- Implementar e testar a parte de pagamento com divisão de dinheiro
- Fazer o design patern de strategy para o payment
- Fazer a parte dedicada para as roles no decorator