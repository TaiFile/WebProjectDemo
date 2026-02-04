# Backend Demo NestJS

Backend production-ready demonstrando boas práticas com **NestJS + TypeScript** usando **Vertical Slice Architecture**.

## 🚀 Stack

- **NestJS** + **TypeScript**
- **PostgreSQL** + **Prisma ORM**
- **Autenticação JWT** (bcrypt + @nestjs/jwt)
- **MercadoPago** (Pagamentos com Cartão, PIX, Boleto)
- **Google Maps API** (Geolocalização e Endereços)
- **Storage**: Local (pasta) + AWS S3 / MinIO
- **Nodemailer** (Envio de emails)
- **Docker**: PostgreSQL + MinIO

## 📁 Estrutura de Pastas

```
src/
├── common/              # Guards, decorators, filters, pipes
├── infrastructure/      # Serviços de infraestrutura
│   ├── database/       # Prisma ORM
│   ├── storage/        # Interface + Local + S3/MinIO
│   ├── payments/       # MercadoPago SDK
│   ├── geolocation/    # Google Maps API
│   └── mail/           # Nodemailer
├── features/           # Vertical Slices (Módulos de negócio)
│   ├── auth/           # Autenticação JWT (login, registro)
│   ├── users/          # Gestão de usuários
│   ├── products/       # CRUD de produtos
│   ├── addresses/      # Endereços com geolocalização
│   ├── payments/       # Pagamentos + Webhooks
│   └── files/          # Upload e gestão de arquivos
└── main.ts
```

## 🎯 Features

### 1. 🔐 Autenticação (JWT)
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login (retorna JWT)
- `POST /auth/confirm-email` - Confirmação de email
- Emails automáticos com Nodemailer
- Senhas hasheadas com bcrypt
- Guards JWT em rotas protegidas

### 2. 👤 Users
- `GET /users/me` - Perfil do usuário autenticado
- `PATCH /users/me` - Atualizar perfil
- Relacionamento com endereços e pagamentos

### 3. 📦 Products
- CRUD completo
- Paginação e filtros
- Soft delete
- Relacionamento com usuário criador

### 4. 📍 Addresses & Geolocalização
- CRUD de endereços
- Geocodificação (endereço → coordenadas)
- Reverse geocoding (coordenadas → endereço)
- Cálculo de distância entre endereços
- Busca de endereços próximos (raio em km)
- Autocomplete de endereços
- Integração com Google Maps API
- Detalhes de lugares (place_id)

### 5. 💳 Payments (MercadoPago)
- `POST /payments/create-preference` - Criar preferência de pagamento
- `POST /webhooks/mercadopago` - Webhook de notificação
- `GET /payments/user/history` - Histórico de pagamentos
- `GET /payments/:id` - Buscar pagamento específico
- `GET /payments/success` - Página de sucesso
- `GET /payments/failure` - Página de erro
- `GET /payments/pending` - Página de pendente
- Suporte para: Cartão de Crédito, PIX, Boleto
- Transações persistidas no banco

### 6. 📁 Files
- `POST /files/upload` - Upload (local ou S3/MinIO)
- `GET /files/:id/download` - Download de arquivo
- `GET /files/:id/url` - Presigned URL (S3)
- `DELETE /files/:id` - Remover arquivo
- Metadados no Prisma
- Suporte para múltiplos storage backends

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

### Obter Credenciais

#### Google Maps API
1. Acessar [Google Cloud Console](https://console.cloud.google.com)
2. Criar projeto e habilitar APIs: Geocoding, Distance Matrix, Places
3. Criar credencial de API Key
4. Adicionar no `.env`: `GOOGLE_MAPS_API_KEY=`

#### MercadoPago
1. Criar conta em [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Copiar Access Token de TESTE
3. Adicionar no `.env`: `MERCADOPAGO_ACCESS_TOKEN=TEST-...`

## 🌍 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://demo_user:demo_pass@localhost:5432/demo_db

# JWT Authentication
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
JWT_EXPIRES_IN=24h

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-012345-abc...

# Google Maps API
GOOGLE_MAPS_API_KEY=AIzaSyB...

# Storage
STORAGE_TYPE=local  # ou 's3'
UPLOAD_PATH=./uploads

# AWS S3 / MinIO (se STORAGE_TYPE=s3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET=demo-bucket
AWS_ENDPOINT=http://localhost:9000  # Para MinIO

# Email (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASSWORD=sua-app-password
MAIL_FROM=noreply@example.com

# App
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
PORT=3000
NODE_ENV=development
```

## 📚 Documentação

### API Testing
- **Coleção Insomnia**: [docs/insomnia_collection.json](docs/insomnia_collection.json)
- **Health Check**: http://localhost:3000/api/health

### Guias Completos
- 📖 [Índice da Documentação](docs/README.md)
- 🚀 [Guia de Instalação](docs/INSTALACAO.md)
- 🔐 [Autenticação JWT](docs/AUTENTICACAO_JWT.md)
- 📍 [Geolocalização](docs/GEOLOCALIZACAO.md)
- 💳 [Testar Pagamentos](docs/TESTAR_METODOS_PAGAMENTO.md)
- 🪣 [Configurar MinIO](docs/MINIO.md)

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

- **Database**: Prisma Client + Repository Pattern
- **Storage**: Interface + Local + S3/MinIO implementations
- **Payments**: MercadoPago SDK v2
- **Geolocation**: Google Maps API (Geocoding, Distance Matrix, Places)
- **Mail**: Nodemailer (Gmail/Ethereal)

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
npm run format:check       # Verificar formatação (CI)
```

## 🔧 CI/CD

Pipeline configurado para GitHub Actions e GitLab CI:

- ✅ **Prettier**: Verifica formatação do código
- ✅ **ESLint**: Análise de qualidade
- ✅ **Build**: Compila TypeScript + Gera Prisma Client
- ✅ **Tests**: Executa testes unitários

## 🎓 Boas Práticas Implementadas

✅ Validação com Zod schemas  
✅ Guards JWT personalizados  
✅ Decorators customizados (@CurrentUser, @Roles)  
✅ Logging estruturado com interceptors  
✅ Exception filters globais  
✅ Health checks (/api/health)  
✅ Dual storage strategy (Local/S3/MinIO)  
✅ Repository pattern para dados  
✅ Vertical Slice Architecture  
✅ Environment configuration  
✅ Email confirmação de conta  
✅ Senhas hasheadas (bcrypt)  
✅ Webhooks para pagamentos  
✅ Geolocalização com cache  
✅ CI/CD (GitHub Actions + GitLab CI)  

## 📄 Licença

MIT

## 🗺️ Roadmap

**To Do**:
- Fazer a parte de categoria
- Implementar e testar a parte de pagamento com divisão de dinheiro
- Fazer o design pattern de strategy para o payment
- Fazer a parte dedicada para as roles no decorator


---

**Objetivo**: Backend production-ready demonstrando boas práticas, pronto para clonar e iniciar novos projetos.

**Desenvolvido com:** NestJS • TypeScript • Prisma • PostgreSQL • Docker