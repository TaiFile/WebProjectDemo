# 🎨 RSA EXPLICADO COM DESENHOS SIMPLES

## 🔑 A Ideia Básica

Imagine que você tem **2 chaves**:

```
┌─────────────────────┐         ┌─────────────────────┐
│   CHAVE VERMELHA    │         │   CHAVE VERDE       │
│       🔴            │         │       🟢            │
│                     │         │                     │
│  FECHA (assina)     │         │  ABRE (valida)      │
│                     │         │                     │
│  📕 PRIVADA         │         │  📗 PÚBLICA         │
│  (só você tem)      │         │  (todo mundo tem)   │
└─────────────────────┘         └─────────────────────┘
```

---

## 📦 Como Funciona: Caixa com Cadeado

### Passo 1: Você fecha a caixa (Login)

```
┌──────────────────────────────────────────────┐
│  Servidor cria um "pacote" (token)          │
│                                              │
│  📦 Dentro:                                  │
│     - userId: "abc123"                       │
│     - email: "user@email.com"                │
│     - roles: ["USER"]                        │
│                                              │
│  🔴 Fecha com CHAVE VERMELHA (privada)      │
│                                              │
│  📦🔒 Pacote lacrado!                        │
│                                              │
│  ✅ Só quem tem chave VERMELHA pode fazer   │
└──────────────────────────────────────────────┘
```

### Passo 2: Cliente guarda o pacote

```
┌──────────────────────────────────────────────┐
│  Cliente (Browser) recebe:                   │
│                                              │
│  📦🔒 Token: "eyJhbGciOiJSUzI1N..."         │
│                                              │
│  Guarda no localStorage                      │
└──────────────────────────────────────────────┘
```

### Passo 3: Cliente envia o pacote de volta (Request)

```
┌──────────────────────────────────────────────┐
│  Cliente:                                    │
│  "Quero acessar meus dados"                 │
│                                              │
│  GET /api/users/me                          │
│  📦🔒 Token anexado no header               │
└──────────────────────────────────────────────┘
```

### Passo 4: Servidor valida (usa chave verde)

```
┌──────────────────────────────────────────────┐
│  Servidor recebe o pacote                    │
│                                              │
│  📦🔒 Token                                  │
│                                              │
│  🟢 Tenta abrir com CHAVE VERDE (pública)   │
│                                              │
│  ✅ SE ABRIR = Token válido!                │
│     → Significa que foi fechado com a RED   │
│     → Confia no conteúdo                    │
│     → Permite acesso                         │
│                                              │
│  ❌ SE NÃO ABRIR = Token inválido!          │
│     → Foi adulterado                        │
│     → Ou expirou                            │
│     → Bloqueia acesso                       │
└──────────────────────────────────────────────┘
```

---

## 🎯 Por Que 2 Chaves?

### 🤔 Por que não usar só 1 chave (como antes)?

```
❌ CHAVE ÚNICA (método antigo HMAC):

┌───────────────────────────────────────┐
│  Servidor tem 1 chave: 🔑            │
│                                       │
│  🔑 → Fecha o pacote                 │
│  🔑 → Abre o pacote                  │
│                                       │
│  ⚠️ PROBLEMA:                        │
│  Se alguém rouba a 🔑:               │
│  - Pode criar pacotes falsos         │
│  - Pode se passar por qualquer user  │
│  - Todos os serviços comprometidos!  │
└───────────────────────────────────────┘
```

```
✅ 2 CHAVES (método novo RSA):

┌───────────────────────────────────────┐
│  Servidor Auth tem 2 chaves:         │
│                                       │
│  🔴 VERMELHA (privada)               │
│     → Fecha pacotes                   │
│     → Só no servidor de login        │
│     → NUNCA sai de lá                │
│                                       │
│  🟢 VERDE (pública)                  │
│     → Abre pacotes                   │
│     → Pode estar em todos servidores │
│     → Pode vazar sem problema!       │
│                                       │
│  ✅ SEGURO:                          │
│  Mesmo se roubarem a 🟢:             │
│  - Não conseguem criar pacotes       │
│  - Só validam (que já era público)  │
│  - Sistema continua seguro!          │
└───────────────────────────────────────┘
```

---

## 🏢 Exemplo Real: Empresa com Vários Prédios

```
┌─────────────────────────────────────────────────────────┐
│                     SUA EMPRESA                          │
└─────────────────────────────────────────────────────────┘

🏢 PRÉDIO 1 (Auth Service)
   👔 Porteiro-Chefe
   🔴 Tem carimbo especial (chave privada)
   📝 Cria crachás oficiais
   ✅ Só ele pode criar crachás

🏢 PRÉDIO 2 (API Service)
   👮 Segurança
   🟢 Sabe como verificar crachás (chave pública)
   ✅ Valida se o crachá é oficial
   ❌ Não pode criar crachás

🏢 PRÉDIO 3 (Admin Service)
   👮 Segurança
   🟢 Sabe como verificar crachás (chave pública)
   ✅ Valida se o crachá é oficial
   ❌ Não pode criar crachás

┌─────────────────────────────────────────┐
│  Como funciona:                         │
│                                         │
│  1. João vai ao Prédio 1 (login)       │
│     → Porteiro cria crachá com 🔴      │
│     → João recebe: 👤🎫                │
│                                         │
│  2. João vai ao Prédio 2               │
│     → Mostra crachá: 👤🎫              │
│     → Segurança valida com 🟢          │
│     → ✅ Deixa entrar                  │
│                                         │
│  3. Ladrão tenta falsificar crachá     │
│     → Não tem o carimbo 🔴             │
│     → Segurança valida com 🟢          │
│     → ❌ Crachá falso! Não entra       │
└─────────────────────────────────────────┘
```

---

## 💻 No Seu Código (Simplificado)

### Arquivo 1: `generate-keys.ps1`

```powershell
# Este script cria as 2 chaves:

OpenSSL cria:
📕 private.pem  → Chave VERMELHA 🔴
📗 public.pem   → Chave VERDE 🟢
```

### Arquivo 2: `application.yml`

```yaml
app:
  jwt:
    private-key: classpath:certs/private.pem  # 🔴
    public-key: classpath:certs/public.pem    # 🟢
```

### Arquivo 3: `SecurityConfig.java`

```java
@Bean
public JwtEncoder jwtEncoder() {
    // Carrega chave 🔴 (privada)
    // Usado para CRIAR tokens
    return new NimbusJwtEncoder(privateKey);
}

@Bean
public JwtDecoder jwtDecoder() {
    // Carrega chave 🟢 (pública)
    // Usado para VALIDAR tokens
    return NimbusJwtDecoder.withPublicKey(publicKey);
}
```

### Arquivo 4: `JwtService.java`

```java
public String generateToken(String userId, String email, List<String> roles) {
    // Cria conteúdo do token
    JwtClaimsSet claims = JwtClaimsSet.builder()
        .subject(userId)
        .claim("email", email)
        .claim("roles", roles)
        .build();
    
    // 🔴 USA CHAVE VERMELHA (privada) PARA ASSINAR
    return jwtEncoder.encode(claims).getTokenValue();
}
```

### Arquivo 5: `SecurityConfig.java` (OAuth2)

```java
.oauth2ResourceServer(oauth2 -> oauth2
    .jwt(jwt -> jwt.jwtAuthenticationConverter(...)))

// 🟢 Spring automaticamente usa CHAVE VERDE (pública)
// para validar todos os tokens que chegam!
```

---

## 🎮 Teste Prático

Vamos fazer um teste!

### 1. Gere as chaves:
```powershell
.\generate-keys.ps1
```

### 2. Veja as chaves criadas:
```
src/main/resources/certs/
├── private.pem  → 🔴 (2048 bits de números aleatórios!)
└── public.pem   → 🟢 (derivada da privada)
```

### 3. Abra `private.pem`:
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7...
(muitos números)
-----END PRIVATE KEY-----
```

### 4. Abra `public.pem`:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu5O...
(menos números que a privada)
-----END PUBLIC KEY-----
```

**São matematicamente relacionadas, mas:**
- 🔴 Privada: Não dá para descobrir a partir da pública
- 🟢 Pública: Derivada da privada, mas não revela ela

---

## 🎓 RESUMÃO ULTRA SIMPLES

```
1. CHAVES RSA = 2 CHAVES MÁGICAS
   🔴 Vermelha (privada) = Fecha
   🟢 Verde (pública) = Abre

2. TOKEN = CAIXINHA LACRADA
   Login → 🔴 fecha → Cliente guarda
   Request → Cliente manda → 🟢 abre → ✅ ou ❌

3. POR QUE SEGURO?
   Só quem tem 🔴 pode criar tokens
   Mesmo se roubarem 🟢, não conseguem criar

4. NO SEU PROJETO:
   .\generate-keys.ps1 → Cria as chaves
   Spring Security → Usa automaticamente
   Você → Só recebe Authentication nos métodos

5. MICROSERVIÇOS?
   Auth Service → Guarda 🔴 (cria tokens)
   Outros Services → Tem 🟢 (validam tokens)
   Todos felizes! 🎉
```

---

## ❓ Última Dúvida?

### "Mas eu preciso entender a matemática?"

**❌ NÃO!**

É como dirigir um carro:
- Você não precisa saber como o motor funciona
- Você só precisa saber: acelerar, frear, virar

Com RSA:
- Você não precisa saber a matemática complexa
- Você só precisa saber: gerar chaves, usar no código

**OpenSSL** faz a parte difícil.
**Spring Security** faz a integração.
**Você** só usa! 😎

---

**🎉 Pronto! Agora você entende RSA de verdade!**

**Resumindo:**
- 2 chaves: 🔴 cria, 🟢 valida
- Muito mais seguro que 1 chave só
- OpenSSL gera, Spring Security usa
- Você só precisa rodar `.\generate-keys.ps1`
- Done! ✅
