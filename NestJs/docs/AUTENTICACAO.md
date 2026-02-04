# 🔐 Autenticação com Keycloak - Explicação Detalhada

## 📚 Entendendo a Arquitetura

### **Keycloak (Servidor de Autenticação)**
```
Responsabilidades:
├── Gerenciar usuários (CRUD)
├── Interface de login/logout
├── EMITIR tokens JWT
├── Gerenciar permissões e roles
└── Renovar tokens (refresh tokens)
```

**Localização:** Container Docker (porta 8080)  
**Analogia:** É o "banco" que emite os cartões (tokens)

---

### **nest-keycloak-connect (Biblioteca de Integração)**
```
Responsabilidades:
├── Comunicar com o Keycloak
├── Buscar chaves públicas do Keycloak
├── VALIDAR assinatura dos tokens
├── Verificar expiração
└── Configurar guards automáticos
```

**Localização:** `node_modules/nest-keycloak-connect`  
**Instalada em:** `package.json`

---

### **jwt-auth.guard.ts (Guard Customizado)**
```
Responsabilidades:
├── Usar o AuthGuard do nest-keycloak-connect
├── PROTEGER rotas específicas
├── Extrair dados do usuário
└── Personalizar mensagens de erro
```

**Localização:** `src/common/guards/jwt-auth.guard.ts`  
**Analogia:** É a "maquininha" que valida se o cartão é verdadeiro

---

## 🔄 Fluxo Completo de Autenticação

### **1. Login (Frontend → Keycloak)**
```javascript
POST http://localhost:8080/realms/demo-realm/protocol/openid-connect/token
Body: {
  client_id: "demo-client",
  username: "testuser",
  password: "password123",
  grant_type: "password"
}

Resposta do Keycloak:
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",  // ← TOKEN JWT
  "expires_in": 300,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

**O que acontece:**
- ✅ Keycloak valida username/password
- ✅ Keycloak **ASSINA** o JWT com sua chave privada
- ✅ Token contém: user_id, email, roles, expiração, etc.

---

### **2. Requisição ao Backend (Frontend → NestJS)**
```javascript
GET http://localhost:3000/api/users/me
Headers: {
  Authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**O que acontece:**

#### **Passo 1: Interceptação pelo Guard**
```typescript
// src/common/guards/jwt-auth.guard.ts
@UseGuards(JwtAuthGuard)  // ← Protege a rota
```

#### **Passo 2: Validação pelo nest-keycloak-connect**
```typescript
// Internamente, a biblioteca faz:
1. Extrai o token do header Authorization
2. Busca as chaves públicas do Keycloak (cache)
3. VALIDA a assinatura do token
   - Se a assinatura bater = Token é legítimo ✅
   - Se não bater = Token foi adulterado ❌
4. Verifica expiração (exp claim)
5. Verifica issuer (iss claim) = Keycloak correto
```

#### **Passo 3: Anexar Usuário ao Request**
```typescript
// jwt-auth.guard.ts personaliza os dados
const keycloakUser = {
  sub: "uuid-do-keycloak",
  email: "user@example.com",
  name: "João Silva",
  roles: ["user", "admin"]
}

request.user = keycloakUser;  // ← Disponível nos controllers
```

#### **Passo 4: Controller Acessa o Usuário**
```typescript
@Get('me')
async getProfile(@CurrentUser() user: KeycloakUser) {
  // user.sub = ID do Keycloak
  // user.email = Email do usuário
  // user.roles = Permissões
}
```

---

## 🔒 Segurança: Por que é importante validar?

### **❌ SEM Validação (Apenas Decodificar)**
```typescript
// INSEGURO! Apenas decodifica Base64
const payload = Buffer.from(token.split('.')[1], 'base64').toString();
const user = JSON.parse(payload);

// PROBLEMA: Qualquer pessoa pode criar um token falso!
// Basta fazer Base64 encode de: {"sub": "fake-admin", "roles": ["admin"]}
```

### **✅ COM Validação (nest-keycloak-connect)**
```typescript
// SEGURO! Valida assinatura criptográfica
const isValid = await verifySignature(token, keycloakPublicKey);

if (!isValid) {
  throw new UnauthorizedException(); // ← Bloqueia tokens falsos
}

// Só aceita tokens ASSINADOS pelo Keycloak
// Impossível forjar sem a chave privada do Keycloak
```

---

## 🛠️ Configuração Atual

### **1. KeycloakModule** (`src/infrastructure/keycloak/keycloak.module.ts`)
```typescript
KeycloakConnectModule.registerAsync({
  authServerUrl: 'http://localhost:8080',     // URL do Keycloak
  realm: 'demo-realm',                        // Realm configurado
  clientId: 'demo-client',                    // Client ID
  bearerOnly: true,                           // API apenas valida tokens
  policyEnforcement: 'permissive',            // Modo dev (menos restritivo)
})
```

### **2. JwtAuthGuard** (`src/common/guards/jwt-auth.guard.ts`)
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard {  // ← Estende AuthGuard do Keycloak
  async canActivate(context: ExecutionContext) {
    // 1. Chama validação do Keycloak
    const isValid = await super.canActivate(context);
    
    // 2. Personaliza dados do usuário
    request.user = this.keycloakService.extractUserFromToken(request.user);
    
    return isValid;
  }
}
```

### **3. Uso nos Controllers**
```typescript
@UseGuards(JwtAuthGuard)  // ← Protege a rota
@Get('me')
getProfile(@CurrentUser() user: KeycloakUser) {
  // Só chega aqui se token for válido
}
```

---

## 🔍 Como Testar

### **1. Obter Token do Keycloak**
```powershell
# PowerShell
$body = @{
    client_id = "demo-client"
    username = "testuser"
    password = "password123"
    grant_type = "password"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/realms/demo-realm/protocol/openid-connect/token" `
    -Method POST `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded"

$token = $response.access_token
Write-Host $token
```

### **2. Testar no Swagger**
1. Acesse http://localhost:3000/api
2. Clique em **"Authorize"** (cadeado)
3. Cole o token obtido
4. Teste os endpoints protegidos

### **3. Testar Token Inválido**
```powershell
# Tentar com token fake (vai ser rejeitado)
$headers = @{
    Authorization = "Bearer token-falso-12345"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/users/me" -Headers $headers
# ❌ Resultado: 401 Unauthorized
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Decodificar) | Depois (Validar) |
|---------|-------------------|------------------|
| **Segurança** | ❌ Inseguro | ✅ Seguro |
| **Validação** | Apenas decodifica Base64 | Valida assinatura RSA256 |
| **Tokens Falsos** | ❌ Aceita qualquer token | ✅ Rejeita tokens não assinados |
| **Expiração** | ❌ Não verifica | ✅ Verifica automaticamente |
| **Chaves Públicas** | ❌ Não usa | ✅ Busca do Keycloak |
| **Produção** | ❌ NÃO usar | ✅ Production-ready |

---

## 🎓 Resumo

### **Keycloak:**
- 🏦 Servidor central de autenticação
- 🔑 Emite tokens JWT assinados
- 👥 Gerencia usuários e permissões

### **nest-keycloak-connect:**
- 📦 Biblioteca de integração
- 🔒 Valida assinatura dos tokens
- 🔗 Conecta NestJS com Keycloak

### **jwt-auth.guard.ts:**
- 🛡️ Guard customizado do NestJS
- 🎯 Protege rotas específicas
- 👤 Extrai e personaliza dados do usuário

---

**Agora seu backend valida tokens de VERDADE com segurança criptográfica!** 🎉
