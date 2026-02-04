# 🔧 Solução: Erro ao Registrar Usuário (Email)

## ❌ Problema Original

```
org.springframework.mail.MailAuthenticationException: Authentication failed
Caused by: jakarta.mail.AuthenticationFailedException: 
535-5.7.8 Username and Password not accepted
```

**Causa**: O sistema tentava enviar email de confirmação, mas as credenciais do Gmail não estavam configuradas, causando um erro 500 e impedindo o registro do usuário.

---

## ✅ Soluções Implementadas

### 1️⃣ **Envio de Email Não-Bloqueante**

O envio de email agora acontece **após o commit da transação** usando `TransactionSynchronization`:

```java
// Antes: Se o email falhar, o registro todo falha ❌
user = userRepository.save(user);
mailService.sendConfirmationEmail(user.getEmail(), token);

// Depois: Email é enviado depois, se falhar não afeta o registro ✅
user = userRepository.save(user);
TransactionSynchronizationManager.registerSynchronization(
    new TransactionSynchronization() {
        @Override
        public void afterCommit() {
            mailService.sendConfirmationEmail(userEmail, token);
        }
    }
);
```

**Benefício**: Mesmo que o email falhe, o usuário é registrado no banco de dados.

---

### 2️⃣ **Tratamento de Erro Robusto no MailService**

```java
@Async
public void sendEmail(String to, String subject, String htmlContent) {
    try {
        // ...enviar email...
        log.info("✅ Email sent successfully to: {}", to);
    } catch (Exception e) {
        log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        log.warn("⚠️ Email service is not configured properly. User can still access the system.");
    }
}
```

**Benefício**: Captura qualquer exceção de email e não propaga para o controller.

---

### 3️⃣ **Modo de Desenvolvimento sem Confirmação de Email**

Adicionada configuração no `application.yml`:

```yaml
app:
  auth:
    require-email-confirmation: ${REQUIRE_EMAIL_CONFIRMATION:false}
```

**Comportamento**:
- **false** (padrão): Usuário pode fazer login sem confirmar email (ideal para DEV)
- **true**: Usuário precisa confirmar email antes de fazer login (ideal para PROD)

---

## 🚀 Como Usar Agora

### Opção A: Desenvolvimento Local (sem email)

1. **Mantenha a configuração padrão** (`require-email-confirmation: false`)
2. **Registre um usuário**:
   ```bash
   POST /api/auth/register
   {
     "name": "João Silva",
     "email": "joao@example.com",
     "password": "senha123"
   }
   ```
3. **Faça login diretamente** (sem confirmar email):
   ```bash
   POST /api/auth/login
   {
     "email": "joao@example.com",
     "password": "senha123"
   }
   ```

✅ **Funciona mesmo sem configurar email!**

---

### Opção B: Configurar Email do Gmail (Produção)

Se quiser **realmente enviar emails**, configure no `application-dev.properties`:

```properties
# Gmail com App Password
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seuemail@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password (não a senha normal!)
MAIL_FROM=seuemail@gmail.com

# Habilitar validação de email
REQUIRE_EMAIL_CONFIRMATION=true
```

**Como gerar App Password do Gmail**:
1. Acesse: https://myaccount.google.com/apppasswords
2. Crie uma senha de app para "Mail"
3. Use a senha gerada (16 caracteres) no `MAIL_PASSWORD`

---

## 📋 Checklist

- [x] Envio de email não bloqueia registro
- [x] Tratamento de erro robusto para email
- [x] Modo desenvolvimento sem validação de email
- [x] Logs informativos sobre status do email
- [x] `application-dev.properties` no `.gitignore`
- [x] Configuração flexível via variáveis de ambiente

---

## 🎯 Resultado Final

✅ **Registro de usuário sempre funciona**  
✅ **Email é enviado em background (não bloqueia)**  
✅ **Erros de email não quebram o sistema**  
✅ **Desenvolvimento local funciona sem configurar email**  
✅ **Fácil de configurar email em produção**  

---

## 🔍 Testando Agora

Tente registrar novamente:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste User",
    "email": "teste@example.com",
    "password": "senha123"
  }'
```

**Resposta esperada** (200 OK):
```json
{
  "message": "Usuário registrado com sucesso! Verifique seu email para confirmar a conta.",
  "user": {
    "id": "uuid-gerado",
    "email": "teste@example.com",
    "name": "Teste User"
  }
}
```

E depois pode fazer login diretamente! 🚀
