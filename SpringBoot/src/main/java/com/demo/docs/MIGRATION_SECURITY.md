# 🔐 Migração para Spring OAuth2 Resource Server + RSA JWT

## 📋 Mudanças Implementadas

### ✅ Antes (Implementação Antiga)
- ❌ JWT customizado com JJWT e chave simétrica (HMAC-SHA256)
- ❌ Lógica de segurança espalhada (`common/security`)
- ❌ Sem autorização declarativa (@PreAuthorize)
- ❌ Chave secreta compartilhada (menos seguro)

### ✨ Depois (Nova Implementação)
- ✅ **Spring OAuth2 Resource Server** (padrão Spring)
- ✅ **JWT com RSA** (chaves assimétricas - mais seguro)
- ✅ **@PreAuthorize** para autorização declarativa
- ✅ **Roles no token** (sem consultar BD em cada request)
- ✅ **SecurityService** para regras customizadas
- ✅ Arquitetura em `infrastructure/security`

---

## 🚀 Como Executar a Migração

### 1️⃣ **Gerar Chaves RSA**

**No Windows (PowerShell):**
```powershell
.\generate-keys.ps1
```

**No Linux/Mac:**
```bash
chmod +x generate-keys.sh
./generate-keys.sh
```

Isso criará:
- `src/main/resources/certs/private.pem` (chave privada)
- `src/main/resources/certs/public.pem` (chave pública)

### 2️⃣ **Atualizar Dependências**

```bash
mvn clean install
```

### 3️⃣ **Remover Código Antigo**

Você pode deletar:
- ❌ `src/main/java/com/demo/common/security/JwtService.java` (antigo)
- ❌ `src/main/java/com/demo/common/security/SecurityConfig.java` (antigo)
- ❌ `src/main/java/com/demo/common/security/JwtAuthenticationFilter.java` (se existir)

### 4️⃣ **Atualizar AuthService**

O `AuthService` precisa usar o novo `JwtService` (exemplo abaixo).

### 5️⃣ **Adicionar @PreAuthorize nos Controllers**

Exemplo:
```java
@DeleteMapping("/{id}")
@PreAuthorize("@securityService.isAdminOrOwner(authentication, #product.createdBy.id)")
public ResponseEntity<Void> delete(@PathVariable String id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
}
```

---

## 📖 Usando @PreAuthorize

### Exemplos Práticos

#### 1. **Apenas o Dono pode Acessar**
```java
@PreAuthorize("@securityService.isOwner(authentication, #userId)")
public ResponseEntity<UserResponse> getUser(@PathVariable String userId) {
    // ...
}
```

#### 2. **Admin ou Dono**
```java
@PreAuthorize("@securityService.isAdminOrOwner(authentication, #userId)")
public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
    // ...
}
```

#### 3. **Apenas Admin**
```java
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<List<UserResponse>> getAllUsers() {
    // ...
}
```

#### 4. **Qualquer Usuário Autenticado**
```java
@PreAuthorize("isAuthenticated()")
public ResponseEntity<UserResponse> getMe(Authentication auth) {
    // ...
}
```

#### 5. **Email Confirmado**
```java
@PreAuthorize("@securityService.hasEmailConfirmed(authentication)")
public ResponseEntity<Void> createProduct() {
    // ...
}
```

---

## 🔑 Como Obter o Usuário Atual

### Antes:
```java
@GetMapping("/me")
public ResponseEntity<UserResponse> getMe(@CurrentUser UserPrincipal currentUser) {
    String userId = currentUser.getId();
    // ...
}
```

### Depois:
```java
@GetMapping("/me")
public ResponseEntity<UserResponse> getMe(Authentication auth) {
    String userId = auth.getName(); // Retorna o subject (userId)
    // ...
}
```

---

## 🛠️ SecurityService - Métodos Disponíveis

| Método | Descrição | Uso |
|--------|-----------|-----|
| `isOwner` | Verifica se é o dono do recurso | `@PreAuthorize("@securityService.isOwner(authentication, #userId)")` |
| `isAdminOrOwner` | Admin ou dono | `@PreAuthorize("@securityService.isAdminOrOwner(authentication, #userId)")` |
| `canAccessProduct` | Pode acessar produto | `@PreAuthorize("@securityService.canAccessProduct(authentication, #productCreatorId)")` |
| `canAccessAddress` | Pode acessar endereço | `@PreAuthorize("@securityService.canAccessAddress(authentication, #addressUserId)")` |
| `canAccessPayment` | Pode acessar pagamento | `@PreAuthorize("@securityService.canAccessPayment(authentication, #paymentUserId)")` |
| `hasEmailConfirmed` | Email confirmado | `@PreAuthorize("@securityService.hasEmailConfirmed(authentication)")` |

---

## 🎯 Vantagens da Nova Abordagem

### 🔐 Segurança
- ✅ **RSA** é mais seguro que HMAC (chaves assimétricas)
- ✅ Padrão **OAuth2** amplamente testado
- ✅ **Roles no token** = menos consultas ao banco

### 🧹 Código Limpo
- ✅ **@PreAuthorize** deixa o código declarativo
- ✅ **SecurityService** centraliza regras de negócio
- ✅ Menos código boilerplate

### 📈 Escalabilidade
- ✅ Fácil adicionar **microserviços** (mesma chave pública)
- ✅ **Chave pública** pode ser compartilhada
- ✅ **Chave privada** fica só no auth service

### 🧪 Testabilidade
- ✅ Fácil mockar `Authentication`
- ✅ Fácil testar com `@WithMockUser`

---

## 🔄 Checklist de Migração

- [ ] Gerar chaves RSA
- [ ] Atualizar dependências (`mvn clean install`)
- [ ] Deletar arquivos antigos de segurança
- [ ] Atualizar `AuthService` para usar novo `JwtService`
- [ ] Substituir `@CurrentUser UserPrincipal` por `Authentication auth`
- [ ] Adicionar `@PreAuthorize` nos controllers
- [ ] Testar login e acesso protegido
- [ ] Verificar que roles funcionam

---

## 📝 Exemplo Completo: ProductController

### Antes:
```java
@DeleteMapping("/{id}")
@SecurityRequirement(name = "bearerAuth")
public ResponseEntity<Void> delete(@PathVariable String id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
}
```

### Depois:
```java
@DeleteMapping("/{id}")
@PreAuthorize("@securityService.canAccessProduct(authentication, @productService.getCreatorId(#id)) or hasRole('ADMIN')")
public ResponseEntity<Void> delete(@PathVariable String id) {
    productService.delete(id);
    return ResponseEntity.noContent().build();
}
```

---

## ⚠️ IMPORTANTE

1. **NUNCA** faça commit da chave privada (`private.pem`)
2. **Adicione** `src/main/resources/certs/` no `.gitignore` ✅ (já feito)
3. Em **produção**, use **variáveis de ambiente** ou **secrets manager**
4. **Rotacione** as chaves periodicamente (a cada 6-12 meses)

---

## 🎉 Pronto!

Agora você tem uma arquitetura de segurança **profissional**, **escalável** e **declarativa**!

**Dúvidas?** Consulte a documentação:
- [Spring OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [@PreAuthorize Guide](https://docs.spring.io/spring-security/reference/servlet/authorization/expression-based.html)
