# 🔐 Autenticação com JWT

## Visão Geral

O backend agora usa **JWT (JSON Web Tokens)** para autenticação, removendo a dependência do Keycloak.

## 📋 Fluxo de Autenticação

### 1. Registrar Novo Usuário
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "SenhaForte123",
  "name": "João Silva"
}
```

**Resposta (201):**
```json
{
  "message": "Usuário criado com sucesso. Verifique seu email para confirmar a conta.",
  "user": {
    "id": "uuid-aqui",
    "email": "usuario@example.com",
    "name": "João Silva"
  }
}
```

**O que acontece:**
- ✅ Usuário é criado com senha hasheada (bcrypt)
- ✅ Token de confirmação de email é gerado
- ✅ Email de confirmação é enviado (por enquanto apenas logado no console)
- ✅ Campo `emailConfirmed` começa como `false`

---

### 2. Confirmar Email
```http
POST /auth/confirm-email
Content-Type: application/json

{
  "token": "token-recebido-no-email"
}
```

**Resposta (200):**
```json
{
  "message": "Email confirmado com sucesso!"
}
```

---

### 3. Fazer Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "SenhaForte123"
}
```

**Resposta (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-aqui",
    "email": "usuario@example.com",
    "name": "João Silva"
  }
}
```

---

### 4. Usar o Token em Requisições Autenticadas
```http
GET /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta (200):**
```json
{
  "id": "uuid-aqui",
  "email": "usuario@example.com",
  "name": "João Silva",
  "avatarUrl": null,
  "createdAt": "2026-01-30T10:00:00.000Z",
  "updatedAt": "2026-01-30T10:00:00.000Z"
}
```

---

### 5. Atualizar Perfil (Autenticado)
```http
PATCH /users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Novo Nome",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

---

## 🔑 Variáveis de Ambiente Necessárias

```bash
# Obrigatórias
JWT_SECRET="sua-chave-secreta-aqui-minimo-32-caracteres"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://demo_user:demo_pass@localhost:5432/demo_db"
```

---

## 🛡️ Como Funciona a Segurança

### Armazenamento de Senha
```typescript
// Nunca armazenamos senha em plain text
const hashedPassword = await bcrypt.hash(password, 10);

// Ao fazer login, comparamos a senha com o hash
const matches = await bcrypt.compare(senhaDigitada, senhaArmazenada);
```

### Validação de Token
```typescript
// O guard valida o token usando a JWT_SECRET
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: UserPayload) {
  // user.sub = ID do usuário
  // user.email = Email do usuário
}
```

### Token JWT
O token contém:
```json
{
  "sub": "user-uuid",      // Subject (ID do usuário)
  "email": "user@email.com",
  "iat": 1672531200,       // Issued at (emitido em)
  "exp": 1672617600        // Expiration (expira em)
}
```

---

## 📝 Próximos Passos

### 1. Integrar com Serviço de Email
Atualmente o email de confirmação é apenas logado no console.

Opções:
- **SendGrid** (recomendado - simples)
- **Mailgun**
- **AWS SES**
- **Gmail SMTP**

```typescript
// Em email.service.ts, substituir console.log por:
// await this.sendgridService.send({ ... })
```

### 2. Implementar Reset de Senha
```http
POST /auth/forgot-password
POST /auth/reset-password
```

### 3. Refresh Token (Optional)
Para renovar o accessToken sem fazer login novamente.

```http
POST /auth/refresh
Body: { refreshToken: "..." }
```

---

## 🧪 Testando no Insomnia

### 1. Registrar
```http
POST http://localhost:3000/api/auth/register
```

### 2. Confirmar Email (pegar token do console)
```http
POST http://localhost:3000/api/auth/confirm-email
Body: {
  "token": "token-do-console"
}
```

### 3. Login
```http
POST http://localhost:3000/api/auth/login
Body: {
  "email": "usuario@example.com",
  "password": "SenhaForte123"
}
```

### 4. Usar Token
```http
GET http://localhost:3000/api/users/me
Headers: Authorization: Bearer [accessToken]
```

---

## ⚠️ Erros Comuns

| Erro | Causa | Solução |
|------|-------|--------|
| `JWT_SECRET não definida` | .env vazio | Adicionar `JWT_SECRET` no .env |
| `Token inválido` | Token expirado ou corrompido | Fazer login novamente |
| `Email não confirmado` | Usuário não clicou no link | Confirmar email primeiro |
| `Email já cadastrado` | Email já existe | Usar outro email ou fazer login |

---

## 📚 Mais Informações

- [JWT.io](https://jwt.io) - Entender tokens JWT
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Hashing de senhas
- [Passport.js](https://www.passportjs.org/) - Autenticação em NestJS
