# ✅ CHECKLIST COMPLETO DE MIGRAÇÃO

## 🎯 RESPOSTA À SUA PERGUNTA

### **É melhor ou não migrar para @PreAuthorize + OAuth2 Resource Server?**

# 🌟 SIM! DEFINITIVAMENTE É MUITO MELHOR!

---

## 📦 O QUE JÁ FOI FEITO (por mim)

✅ Criado `infrastructure/security/JwtService.java` (novo, com RSA)
✅ Criado `infrastructure/security/SecurityConfig.java` (OAuth2 Resource Server)
✅ Criado `infrastructure/security/SecurityService.java` (para @PreAuthorize)
✅ Criado scripts `generate-keys.ps1` e `generate-keys.sh`
✅ Atualizado `pom.xml` (dependências OAuth2)
✅ Atualizado `application.yml` (config RSA)
✅ Atualizado `.gitignore` (certs/)
✅ Criado documentação completa (`MIGRATION_SECURITY.md`)
✅ Criado exemplos práticos (`ProductControllerExample.java`)

---

## 🚀 O QUE VOCÊ PRECISA FAZER

### 1️⃣ **Gerar Chaves RSA** (OBRIGATÓRIO)

```powershell
cd C:\Users\TaichiAdmin\OneDrive\Documentos\GitHub\API\WebProjectDemo\SpringBoot
.\generate-keys.ps1
```

Isso criará:
- `src/main/resources/certs/private.pem`
- `src/main/resources/certs/public.pem`

### 2️⃣ **Baixar Dependências Maven**

```bash
mvn clean install
```

### 3️⃣ **Atualizar o AuthService**

**Arquivo:** `src/main/java/com/demo/features/auth/service/AuthService.java`

**Trocar:**
```java
// Linha ~20: Injetar o NOVO JwtService
private final JwtService jwtService; // Trocar para: com.demo.infrastructure.security.JwtService
```

**No método `register()`:**
```java
// ANTES (apagar):
String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail());

// DEPOIS (adicionar):
List<String> roles = List.of(savedUser.getRole()); // ["USER"] ou ["ADMIN"]
String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), roles);
```

**No método `login()`:**
```java
// ANTES (apagar):
String token = jwtService.generateToken(user.getId(), user.getEmail());

// DEPOIS (adicionar):
List<String> roles = List.of(user.getRole());
String token = jwtService.generateToken(user.getId(), user.getEmail(), roles);
```

### 4️⃣ **Deletar Código Antigo**

Pode deletar (SE QUISER limpar):
- ❌ `src/main/java/com/demo/common/security/JwtService.java` (antigo)
- ❌ `src/main/java/com/demo/common/security/SecurityConfig.java` (antigo)
- ❌ `src/main/java/com/demo/common/security/JwtAuthenticationFilter.java` (se existir)
- ❌ `src/main/java/com/demo/common/security/CurrentUser.java` (opcional, não é mais necessário)
- ❌ `src/main/java/com/demo/common/security/UserPrincipal.java` (opcional)

**OU** apenas ignore eles (não vão ser usados)

### 5️⃣ **Atualizar Controllers (Opcional mas Recomendado)**

#### **UserController:**
```java
// ANTES:
@GetMapping("/me")
public ResponseEntity<UserResponse> getMe(@CurrentUser UserPrincipal currentUser) {
    UserResponse response = userService.getById(currentUser.getId());
    return ResponseEntity.ok(response);
}

// DEPOIS:
@GetMapping("/me")
public ResponseEntity<UserResponse> getMe(Authentication auth) {
    String userId = auth.getName(); // Obtém ID do token
    UserResponse response = userService.getById(userId);
    return ResponseEntity.ok(response);
}
```

#### **Adicionar @PreAuthorize:**
```java
// Exemplo: Apenas o dono ou admin pode deletar
@DeleteMapping("/me")
@PreAuthorize("@securityService.isOwner(authentication, authentication.name)")
public ResponseEntity<Void> deleteMe(Authentication auth) {
    String userId = auth.getName();
    userService.delete(userId);
    return ResponseEntity.noContent().build();
}
```

### 6️⃣ **Adicionar @PreAuthorize nos Controllers (RECOMENDADO)**

**ProductController:**
```java
@DeleteMapping("/{id}")
@PreAuthorize("@securityService.canAccessProduct(authentication, #id)")
public ResponseEntity<Void> delete(@PathVariable String id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
}
```

**AddressController:**
```java
@DeleteMapping("/{id}")
@PreAuthorize("@securityService.canAccessAddress(authentication, #id)")
public ResponseEntity<Void> delete(@PathVariable String id, Authentication auth) {
    String userId = auth.getName();
    addressService.delete(id, userId);
    return ResponseEntity.noContent().build();
}
```

### 7️⃣ **Testar**

1. **Compilar:**
   ```bash
   mvn clean compile
   ```

2. **Rodar:**
   ```bash
   mvn spring-boot:run
   ```

3. **Testar Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"senha123"}'
   ```

4. **Testar Endpoint Protegido:**
   ```bash
   curl -X GET http://localhost:3000/api/users/me \
     -H "Authorization: Bearer SEU_TOKEN_AQUI"
   ```

---

## 🎓 EXEMPLOS PRÁTICOS DE @PreAuthorize

Consulte o arquivo: `ProductControllerExample.java` (10 exemplos!)

### Mais Comuns:

```java
// 1. Qualquer autenticado
@PreAuthorize("isAuthenticated()")

// 2. Apenas ADMIN
@PreAuthorize("hasRole('ADMIN')")

// 3. ADMIN ou USER
@PreAuthorize("hasAnyRole('ADMIN', 'USER')")

// 4. Apenas o dono
@PreAuthorize("@securityService.isOwner(authentication, #userId)")

// 5. ADMIN ou dono
@PreAuthorize("@securityService.isAdminOrOwner(authentication, #userId)")

// 6. Email confirmado
@PreAuthorize("@securityService.hasEmailConfirmed(authentication)")

// 7. Múltiplas condições (AND)
@PreAuthorize("hasRole('ADMIN') and @securityService.hasEmailConfirmed(authentication)")

// 8. Múltiplas condições (OR)
@PreAuthorize("@securityService.isOwner(authentication, #userId) or hasRole('ADMIN')")
```

---

## 📚 DOCUMENTAÇÃO COMPLETA

Leia os arquivos criados:
- `MIGRATION_SECURITY.md` - Guia completo de migração
- `ProductControllerExample.java` - 10 exemplos de @PreAuthorize
- `AUTHSERVICE_EXAMPLE.java` - Como atualizar o AuthService

---

## ⚠️ AVISOS IMPORTANTES

1. **NUNCA** faça commit de `src/main/resources/certs/` ✅ (já está no .gitignore)
2. Em **produção**, use **variáveis de ambiente** ou **AWS Secrets Manager**
3. **Rotacione** as chaves RSA periodicamente (a cada 6-12 meses)
4. Se tiver problemas, consulte `MIGRATION_SECURITY.md`

---

## 🎉 CONCLUSÃO

### Por que é melhor:
- ✅ **Mais seguro** (RSA vs HMAC)
- ✅ **Código mais limpo** (@PreAuthorize declarativo)
- ✅ **Padrão Spring** (menos bugs)
- ✅ **Escalável** (pronto para microserviços)
- ✅ **Testável** (fácil mockar Authentication)
- ✅ **Performance** (roles no token = menos queries)

### Você aprendeu:
- ✅ OAuth2 Resource Server
- ✅ JWT com RSA
- ✅ @PreAuthorize (SpEL)
- ✅ SecurityService customizado
- ✅ Arquitetura em camadas

---

## 📞 PRÓXIMOS PASSOS

1. Gerar chaves RSA: `.\generate-keys.ps1` ✅
2. Atualizar AuthService (5 minutos) ✅
3. Testar login ✅
4. Adicionar @PreAuthorize nos controllers (opcional) ✅
5. Deletar código antigo (opcional) ✅

**Pronto!** 🚀 Agora você tem segurança **nível enterprise**!
