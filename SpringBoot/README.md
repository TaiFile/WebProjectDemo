# WebProjectDemo - Spring Boot API

> 🚀 Backend production-ready em **Java 21 + Spring Boot 3.3** com **Vertical Slice Architecture**

Este projeto é uma réplica do backend NestJS, portado para o ecossistema Java com as mesmas funcionalidades e arquitetura.

---

## 📚 Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| **Core** | Java 21, Spring Boot 3.3 |
| **Database** | PostgreSQL 16, Spring Data JPA, Flyway |
| **Auth** | Spring Security 6, JWT (JJWT) |
| **Docs** | SpringDoc OpenAPI (Swagger UI) |
| **Validação** | Jakarta Bean Validation |
| **Utils** | Lombok, MapStruct |
| **Pagamentos** | MercadoPago Java SDK |
| **Geolocalização** | Google Maps Services for Java |
| **Storage** | AWS SDK v2 (S3/MinIO), Local |
| **Email** | Spring Mail (JavaMail) |
| **Container** | Docker, Docker Compose |

---

## 🏗️ Arquitetura

O projeto segue **Vertical Slice Architecture** (Package by Feature):

```
src/main/java/com/demo/
├── Application.java              # Entry point
├── HealthController.java         # Health check endpoint
├── common/
│   ├── config/                   # Configurações (Security, OpenAPI, Async)
│   ├── exception/                # Exceptions + GlobalExceptionHandler
│   └── security/                 # JWT Filter, Service, UserPrincipal
├── features/
│   ├── auth/                     # Autenticação (Controller, Service, DTOs)
│   ├── users/                    # Usuários (CRUD + UserDetailsService)
│   ├── products/                 # Produtos (CRUD com Soft Delete)
│   ├── addresses/                # Endereços + Geolocalização
│   ├── payments/                 # Pagamentos MercadoPago + Webhooks
│   └── files/                    # Upload de arquivos (Local/S3)
└── infrastructure/
    ├── geolocation/              # Google Maps Service
    ├── mail/                     # Email Service
    ├── payments/                 # MercadoPago Service
    └── storage/                  # StorageService (Local + S3)
```

---

## 🚀 Quick Start

### Pré-requisitos

- Java 21+
- Maven 3.9+
- Docker & Docker Compose (para PostgreSQL e MinIO)

### 1. Clone e configure

```bash
cd SpringBoot
cp .env.example .env
# Edite o .env com suas configurações
```

### 2. Inicie os containers

```bash
docker-compose up -d postgres minio
```

### 3. Execute a aplicação

```bash
# Com Maven
./mvnw spring-boot:run

# Ou compile e execute
./mvnw clean package -DskipTests
java -jar target/*.jar
```

### 4. Acesse

- **API**: http://localhost:3000/api
- **Swagger UI**: http://localhost:3000/api/swagger-ui.html
- **Health Check**: http://localhost:3000/api/health
- **MinIO Console**: http://localhost:9001

---

## 📋 Endpoints

### Auth
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/confirm-email` | Confirmar email |

### Users
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users/me` | Dados do usuário atual |
| PATCH | `/api/users/me` | Atualizar perfil |
| DELETE | `/api/users/me` | Deletar conta |

### Products
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/products` | Listar produtos |
| GET | `/api/products/:id` | Obter produto |
| POST | `/api/products` | Criar produto 🔒 |
| PATCH | `/api/products/:id` | Atualizar produto 🔒 |
| DELETE | `/api/products/:id` | Deletar produto 🔒 |

### Addresses
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/addresses` | Listar endereços 🔒 |
| POST | `/api/addresses` | Criar endereço 🔒 |
| POST | `/api/addresses/calculate-distance` | Calcular distância 🔒 |
| PATCH | `/api/addresses/:id` | Atualizar endereço 🔒 |
| DELETE | `/api/addresses/:id` | Deletar endereço 🔒 |

### Payments
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/payments/create-preference` | Criar preferência 🔒 |
| GET | `/api/payments/user/history` | Histórico 🔒 |
| GET | `/api/payments/:id` | Obter pagamento 🔒 |

### Files
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/files/upload` | Upload de arquivo 🔒 |
| GET | `/api/files` | Listar arquivos 🔒 |
| GET | `/api/files/:id/download` | Download 🔒 |
| DELETE | `/api/files/:id` | Deletar arquivo 🔒 |

🔒 = Requer autenticação JWT

---

## 🔐 Autenticação

O projeto usa JWT (JSON Web Token):

1. Registre um usuário em `/api/auth/register`
2. Confirme o email
3. Faça login em `/api/auth/login`
4. Use o token retornado no header:
   ```
   Authorization: Bearer <seu_token>
   ```

---

## 💳 Pagamentos (MercadoPago)

Configure o `MERCADOPAGO_ACCESS_TOKEN` no `.env` para habilitar:

- Criação de preferências (Checkout Pro)
- Webhooks para atualização de status
- Suporte a PIX, Cartão de Crédito e Boleto

---

## 🗺️ Geolocalização

Configure o `GOOGLE_MAPS_API_KEY` para habilitar:

- Geocoding (endereço → coordenadas)
- Cálculo de distância (com rotas)
- Autocomplete de endereços

---

## 📁 Storage

Escolha entre storage local ou S3/MinIO via `STORAGE_TYPE`:

- **local**: Arquivos salvos em `./uploads`
- **s3**: Arquivos salvos no S3 ou MinIO

---

## 🧪 Testes

```bash
# Executar testes
./mvnw test

# Testes com cobertura
./mvnw test jacoco:report
```

---

## 🐳 Docker

### Build e run completo

```bash
docker-compose up --build
```

### Apenas infraestrutura

```bash
docker-compose up -d postgres minio
```

---

## 📊 Monitoramento

O Spring Actuator está habilitado:

- `/api/actuator/health` - Status da aplicação
- `/api/actuator/info` - Informações da aplicação
- `/api/actuator/metrics` - Métricas

---

## 🔄 Migrações

As migrações são gerenciadas pelo Flyway:

```
src/main/resources/db/migration/
├── V1__Initial_Schema.sql
```

Para criar nova migração:
```bash
# Crie arquivo: V2__Sua_Descricao.sql
```

---

## 📝 Comparação com NestJS

| Feature | NestJS | Spring Boot |
|---------|--------|-------------|
| ORM | Prisma | Spring Data JPA |
| Migrations | Prisma Migrate | Flyway |
| Validation | Zod | Jakarta Validation |
| Auth | @nestjs/jwt | JJWT + Spring Security |
| Docs | Manual | SpringDoc OpenAPI |
| DI | Built-in | Spring IoC |

---

## 📄 Licença

MIT

---

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request
