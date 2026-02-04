# 🔐 ENTENDENDO CHAVES RSA PARA JWT

## 📚 O Problema que Resolve

### ❌ Problema com Chave Simétrica (HMAC - método antigo):

```
┌─────────────────────────────────────────────────────────────┐
│                         SERVIDOR                             │
│                                                              │
│  1. Login → Cria Token                                       │
│     Usa CHAVE SECRETA para ASSINAR                          │
│     Token: "eyJ0eXAiOiJKV1QiLCJhbGc..."                     │
│                                                              │
│  2. Request → Valida Token                                   │
│     Usa a MESMA CHAVE SECRETA para VALIDAR                  │
│                                                              │
│  ⚠️ PROBLEMA: Se alguém descobrir a chave, pode:            │
│     - Criar tokens falsos                                    │
│     - Se passar por qualquer usuário                        │
│     - A chave precisa ser compartilhada em microserviços    │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Solução com Chaves RSA (método novo):

```
┌─────────────────────────────────────────────────────────────┐
│                    CHAVES ASSIMÉTRICAS                       │
│                                                              │
│  📕 CHAVE PRIVADA (private.pem)                             │
│     - Fica APENAS no servidor de autenticação              │
│     - Usada para ASSINAR (criar) tokens                    │
│     - NUNCA é compartilhada                                │
│     - É secreta e segura                                    │
│                                                              │
│  📗 CHAVE PÚBLICA (public.pem)                              │
│     - Pode ser compartilhada com todos                     │
│     - Usada para VALIDAR (verificar) tokens                │
│     - Não consegue criar tokens                            │
│     - Pode ser distribuída livremente                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Como Funciona na Prática

### 1️⃣ **Geração das Chaves** (você faz uma vez)

```bash
.\generate-keys.ps1
```

Isso cria 2 arquivos:

```
src/main/resources/certs/
├── private.pem  📕 (NUNCA compartilhe!)
└── public.pem   📗 (pode compartilhar)
```

**O que acontece:**
```
OpenSSL gera um par de chaves matematicamente relacionadas:
- Private Key = Número gigante secreto
- Public Key  = Número gigante público (derivado da privada)

Elas funcionam juntas, mas:
✅ Privada pode assinar → Pública pode validar
❌ Pública NÃO pode assinar
```

---

### 2️⃣ **Login (Criação do Token)**

```java
// AuthService.java
public AuthResponse login(LoginRequest request) {
    // ... valida usuário ...
    
    List<String> roles = List.of("USER");
    
    // 📕 Usa CHAVE PRIVADA para ASSINAR o token
    String token = jwtService.generateToken(userId, email, roles);
    
    return new AuthResponse(token, userInfo);
}
```

**O que acontece internamente:**

```
┌──────────────────────────────────────────────────────────┐
│ 1. Cria o payload do token:                              │
│    {                                                      │
│      "sub": "user-123",                                   │
│      "email": "user@example.com",                        │
│      "roles": ["USER"],                                   │
│      "iat": 1709500000,                                   │
│      "exp": 1710104800                                    │
│    }                                                      │
│                                                           │
│ 2. Converte para Base64:                                 │
│    eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoi...              │
│                                                           │
│ 3. 📕 ASSINA com CHAVE PRIVADA (RSA-SHA256):            │
│    Cria uma "assinatura digital" única                   │
│    → Só quem tem a chave privada pode criar isso!       │
│                                                           │
│ 4. Junta tudo:                                           │
│    header.payload.signature                              │
│    ↓                                                      │
│    eyJhbGc...eyJzdWI...SflKx...                         │
│                                                           │
│ 5. Retorna o token para o cliente                       │
└──────────────────────────────────────────────────────────┘
```

---

### 3️⃣ **Request Protegido (Validação do Token)**

```java
// Cliente envia:
GET /api/users/me
Authorization: Bearer eyJhbGc...eyJzdWI...SflKx...
```

**O que acontece no servidor:**

```
┌──────────────────────────────────────────────────────────┐
│ SecurityConfig valida automaticamente:                    │
│                                                           │
│ 1. Recebe o token no header                              │
│                                                           │
│ 2. Separa em 3 partes:                                   │
│    - Header                                               │
│    - Payload                                              │
│    - Signature (assinatura)                              │
│                                                           │
│ 3. 📗 Valida com CHAVE PÚBLICA:                          │
│    - Pega header + payload                               │
│    - Usa a chave pública para verificar a assinatura    │
│    - Confirma que foi assinado pela chave privada       │
│                                                           │
│ 4. Se válido:                                            │
│    ✅ Extrai userId e roles                              │
│    ✅ Cria objeto Authentication                         │
│    ✅ Permite o acesso                                   │
│                                                           │
│ 5. Se inválido:                                          │
│    ❌ Token expirado                                     │
│    ❌ Assinatura não bate                               │
│    ❌ Token foi modificado                              │
│    → Retorna 401 Unauthorized                            │
└──────────────────────────────────────────────────────────┘
```

---

## 🔬 Exemplo Prático Completo

### Cenário: Usuário faz login e acessa dados

```
┌─────────────┐                  ┌──────────────────┐
│   Cliente   │                  │     Servidor     │
│  (Browser)  │                  │   (Spring Boot)  │
└─────────────┘                  └──────────────────┘
      │                                    │
      │  POST /api/auth/login              │
      ├────────────────────────────────────>
      │  { email, password }                │
      │                                    │
      │                          📕 Valida user
      │                          📕 Usa CHAVE PRIVADA
      │                          📕 Cria token assinado
      │                                    │
      │  <────────────────────────────────┤
      │  { token: "eyJhbG..." }           │
      │                                    │
      │  Armazena token no localStorage   │
      │                                    │
      │  GET /api/users/me                │
      │  Authorization: Bearer eyJhbG...   │
      ├────────────────────────────────────>
      │                                    │
      │                          📗 Usa CHAVE PÚBLICA
      │                          📗 Valida assinatura
      │                          📗 Extrai userId
      │                          ✅ Token válido!
      │                                    │
      │  <────────────────────────────────┤
      │  { id, email, name }              │
      │                                    │
```

---

## 🎓 Analogia do Mundo Real

Pense nas chaves RSA como um **selo de cera medieval**:

### 📕 **Chave Privada = Anel de Lacre do Rei**
```
┌────────────────────────────────────┐
│  👑 Só o rei tem o anel            │
│                                    │
│  Ele usa o anel para pressionar   │
│  cera quente em cartas oficiais   │
│                                    │
│  ✅ Ninguém mais pode fazer isso  │
│  ✅ É a "assinatura" dele          │
└────────────────────────────────────┘
```

### 📗 **Chave Pública = Conhecimento do Selo**
```
┌────────────────────────────────────┐
│  👥 Todos conhecem o selo do rei   │
│                                    │
│  Quando recebem uma carta,        │
│  verificam se o selo é o correto  │
│                                    │
│  ✅ Sabem que veio do rei          │
│  ❌ Não conseguem criar o selo     │
└────────────────────────────────────┘
```

### 🎯 **JWT com RSA = Carta Lacrada**
```
┌────────────────────────────────────┐
│  📜 Carta (Token JWT)              │
│     ├─ Conteúdo (payload)         │
│     └─ Selo de cera (signature)   │
│                                    │
│  👑 Rei lacra com anel privado     │
│  👥 Todos validam com selo público │
│                                    │
│  ❌ Falsificadores não têm o anel │
│  ❌ Não conseguem criar selo real │
└────────────────────────────────────┘
```

---

## 💡 Por Que é Mais Seguro?

### Comparação Direta:

| Aspecto | HMAC (Antigo) | RSA (Novo) |
|---------|---------------|------------|
| **Chaves** | 1 chave secreta | 2 chaves (par) |
| **Assinar** | Usa chave secreta | Usa chave privada 📕 |
| **Validar** | Usa mesma chave secreta ⚠️ | Usa chave pública 📗 |
| **Compartilhar** | Chave deve ser secreta sempre ⚠️ | Pública pode ser compartilhada ✅ |
| **Segurança** | Se vazar, todos os tokens são comprometidos ❌ | Se vazar a pública, nada acontece ✅ |
| **Microserviços** | Todos precisam da chave secreta ⚠️ | Só precisam da chave pública ✅ |

### Vantagens do RSA:

1. **🔒 Mais Seguro**
   - Chave pública pode vazar sem problemas
   - Só quem tem a privada pode assinar

2. **📈 Escalável**
   - Microserviços só precisam da pública
   - Auth Service guarda a privada

3. **🎯 Padrão da Indústria**
   - OAuth2 usa RSA
   - OpenID Connect usa RSA
   - Google, Facebook, GitHub usam RSA

---

## 🚀 Fluxo Completo no Seu Projeto

```
┌────────────────────────────────────────────────────────────┐
│                      SEU PROJETO                            │
└────────────────────────────────────────────────────────────┘

1. GERAÇÃO DAS CHAVES (uma vez)
   .\generate-keys.ps1
   → Cria private.pem e public.pem

2. CONFIGURAÇÃO (application.yml)
   app:
     jwt:
       private-key: classpath:certs/private.pem  📕
       public-key: classpath:certs/public.pem    📗

3. BEANS (SecurityConfig.java)
   @Bean JwtEncoder  → Usa private.pem para assinar   📕
   @Bean JwtDecoder  → Usa public.pem para validar    📗

4. GERAÇÃO DE TOKEN (JwtService.java)
   generateToken(userId, email, roles)
   → Usa JwtEncoder (chave privada)                   📕
   → Retorna token assinado

5. VALIDAÇÃO AUTOMÁTICA (Spring Security)
   OAuth2ResourceServer valida automaticamente
   → Usa JwtDecoder (chave pública)                   📗
   → Extrai userId e roles
   → Cria Authentication

6. USO NOS CONTROLLERS
   public ResponseEntity<...> method(Authentication auth) {
       String userId = auth.getName();  // Vem do token!
       // ...
   }
```

---

## 🛡️ Segurança das Chaves

### 📕 **Chave Privada (CRITICAL!)**

```bash
❌ NUNCA FAÇA:
- Commit no Git
- Compartilhe por email
- Deixe em código
- Coloque em logs

✅ SEMPRE:
- Guarde em .gitignore
- Use secrets manager (AWS Secrets, Azure KeyVault)
- Variáveis de ambiente em produção
- Rotacione a cada 6-12 meses
```

### 📗 **Chave Pública (Safe)**

```bash
✅ PODE:
- Compartilhar com outros serviços
- Colocar em CDN
- Distribuir publicamente

📝 Ela só valida, não cria tokens!
```

---

## 🎯 RESUMO FINAL

### O que você precisa saber:

1. **RSA = Par de Chaves**
   - Privada 📕 = Assina (cria tokens)
   - Pública 📗 = Valida (verifica tokens)

2. **Você gera uma vez:**
   ```powershell
   .\generate-keys.ps1
   ```

3. **Spring Security cuida do resto:**
   - JwtEncoder usa privada para assinar
   - JwtDecoder usa pública para validar
   - Tudo automático!

4. **Você só usa nos controllers:**
   ```java
   public method(Authentication auth) {
       String userId = auth.getName();
   }
   ```

5. **Muito mais seguro que HMAC!**

---

## 📞 Dúvidas Comuns

### ❓ "E se alguém roubar a chave pública?"
**R:** Não tem problema! A chave pública só valida, não cria tokens.

### ❓ "E se alguém roubar a chave privada?"
**R:** Aí sim é problema! Por isso ela nunca sai do servidor de auth.

### ❓ "Preciso gerar novas chaves sempre?"
**R:** Não! Uma vez gerada, use sempre. Só troque se vazar ou a cada 6-12 meses.

### ❓ "Como funciona em microserviços?"
**R:** 
- Auth Service = guarda chave privada 📕 (cria tokens)
- Outros services = guardam chave pública 📗 (validam tokens)

### ❓ "É difícil implementar?"
**R:** Não! Você já tem tudo pronto. Só precisa:
1. Gerar chaves (`.\generate-keys.ps1`)
2. Compilar (`mvn clean install`)
3. Rodar!

---

**🎉 Agora você entende como funciona! É só gerar as chaves e usar!**
