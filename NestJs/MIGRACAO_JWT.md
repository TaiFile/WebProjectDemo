# 🎉 Migração Concluída: Keycloak → JWT

## ✅ O Que Foi Feito

### 1. **Removido Keycloak**
- ❌ Deletadas dependências: `nest-keycloak-connect`, `jwks-rsa`, `keycloak-connect`
- ❌ Removido módulo `KeycloakModule` do `app.module.ts`
- ❌ Removido container Keycloak do `docker-compose.yml`

### 2. **Implementado JWT**
- ✅ Adicionadas dependências: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`
- ✅ Criada nova **feature de auth**: `src/features/auth/`
- ✅ Implementado `JwtStrategy` com Passport
- ✅ Atualizado `JwtAuthGuard` para usar Passport

### 3. **Criadas Rotas de Autenticação**
```
POST   /auth/register        - Registrar novo usuário
POST   /auth/login           - Fazer login
POST   /auth/confirm-email   - Confirmar email
```

### 4. **Implementada Confirmação de Email**
- ✅ Usuários recebem token ao registrar
- ✅ Precisam confirmar email antes de fazer login
- ✅ Token expira em 24 horas
- ✅ Serviço de email preparado para integração

### 5. **Atualizado Schema do Banco**
```prisma
- keycloakId (removido)
+ password (string, obrigatório)
+ emailConfirmed (boolean)
+ emailConfirmationToken (string, único)
+ emailConfirmationExpires (datetime)
```

### 6. **Criada Documentação**
- 📄 `AUTENTICACAO_JWT.md` - Guia completo
- 📄 `.env.example` - Variáveis necessárias
- 📄 Comentários no código

---

## 🚀 Próximos Passos

### Passo 1: Atualizar .env
```bash
# Copiar .env.example para .env e preencher
JWT_SECRET="gerar-uma-chave-segura-com-32-caracteres"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://demo_user:demo_pass@localhost:5432/demo_db"
```

**Como gerar JWT_SECRET seguro:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

---

### Passo 2: Instalar Dependências
```bash
npm install
```

---

### Passo 3: Executar Migração do Prisma
```bash
npm run prisma:migrate
```

Isso vai:
- Remover coluna `keycloakId`
- Adicionar campos de autenticação
- Atualizar schema do banco

---

### Passo 4: Subir Docker
```bash
docker-compose up -d
```

Agora apenas PostgreSQL vai rodar (sem Keycloak).

---

### Passo 5: Iniciar Backend
```bash
npm run start:dev
```

---

## 🧪 Testar no Insomnia

### 1. Registrar Novo Usuário
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "SenhaForte123",
  "name": "Teste User"
}
```

**Verificar console do backend para pegar token de confirmação**

---

### 2. Confirmar Email
```http
POST http://localhost:3000/api/auth/confirm-email
Content-Type: application/json

{
  "token": "token-do-console"
}
```

---

### 3. Fazer Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "teste@example.com",
  "password": "SenhaForte123"
}
```

**Copiar o `accessToken` da resposta**

---

### 4. Usar Token
```http
GET http://localhost:3000/api/users/me
Authorization: Bearer <seu-access-token>
```

---

## 📊 Comparação: Keycloak vs JWT

| Aspecto | Keycloak | JWT (Novo) |
|--------|----------|-----------|
| **Complexidade** | Alta | Baixa |
| **Setup** | Requer container extra | Apenas variáveis .env |
| **Manutenção** | Mais overhead | Simplificado |
| **Customização** | Limitada | Total |
| **Escalabilidade** | Melhor para empresas | Perfeito para MVPs |
| **Tempo de Deploy** | Mais lento | Mais rápido |

---

## ⚠️ Considerações Importantes

### Senha
- Senhas são hasheadas com **bcrypt** (salt: 10)
- Nunca armazenamos em plain text
- Comparação usa `bcrypt.compare()` (timing attack safe)

### Segurança do JWT_SECRET
- Mantenha em `.env` (NUNCA no Git)
- Use em produção: variáveis de ambiente do servidor
- Mude periodicamente se comprometido

### Email de Confirmação
- Atualmente logado no console
- TODO: Integrar SendGrid, Mailgun, etc
- Token expira em 24 horas

### CORS (Se Frontend Separado)
Adicione em `main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## 📁 Estrutura Criada

```
src/features/auth/
├── auth.controller.ts      # Rotas
├── auth.service.ts         # Lógica
├── email.service.ts        # Envio de email
├── auth.module.ts          # Módulo
├── strategies/
│   ├── jwt.strategy.ts     # Estratégia JWT
│   └── index.ts
├── dtos/
│   └── index.ts            # Esquemas Zod
└── index.ts
```

---

## 🔐 Fluxo de Autenticação Novo

```
1. Usuário registra
   ↓
2. Backend cria usuário + token de confirmação
   ↓
3. Email enviado com token
   ↓
4. Usuário clica no link
   ↓
5. Backend marca email como confirmado
   ↓
6. Usuário faz login com email + senha
   ↓
7. Backend valida e gera JWT
   ↓
8. Usuário usa JWT em requisições autenticadas
```

---

## 💡 Dicas

### Para Testar Sem Email Real
1. Usar console do backend para pegar token
2. Passar manualmente em `/auth/confirm-email`
3. Depois fazer login normalmente

### Para Integrar Email Real
Em `email.service.ts`:
```typescript
// Trocar console.log por:
await this.sendgridService.send({
  to: email,
  subject: 'Confirme seu email',
  html: emailContent,
});
```

### Próxima Feature
- Implementar **Password Reset**
- Implementar **Refresh Token**
- Implementar **2FA (Two Factor Auth)**

---

## ❓ Dúvidas?

Veja `AUTENTICACAO_JWT.md` para documentação completa!

Qualquer erro durante a migração, verifique:
1. ✅ `.env` preenchido com `JWT_SECRET`
2. ✅ Banco de dados PostgreSQL rodando
3. ✅ `npm install` executado
4. ✅ `npm run prisma:migrate` executado
