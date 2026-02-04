# 🧪 Testando Sistema de Email em DEV

## 🎯 Melhores Métodos (do mais simples ao mais completo)

---

## ✅ **Método 1: MailHog (RECOMENDADO)**

**O que é?** Servidor SMTP falso que captura todos os emails em uma interface web.

### **Instalação via Docker:**

```bash
docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog
```

### **Configuração no `application-dev.properties`:**

```properties
# MailHog (SMTP falso)
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false

# Email pode ser qualquer um
spring.mail.from=noreply@teste.com
```

### **Como usar:**

1. **Inicie o MailHog:**
   ```bash
   docker start mailhog
   ```

2. **Registre um usuário com qualquer email:**
   ```json
   POST http://localhost:3000/api/auth/register
   {
     "name": "Teste",
     "email": "qualquercoisa@fake.com",
     "password": "senha123"
   }
   ```

3. **Veja o email capturado:**
   - Abra: http://localhost:8025
   - Você verá o email com o link de confirmação!

### **✅ Vantagens:**
- ✅ Captura todos os emails enviados
- ✅ Interface web linda para ver os emails
- ✅ Não precisa de credenciais reais
- ✅ Mostra HTML renderizado
- ✅ Testa o fluxo completo (inclusive clicando nos links)

---

## ✅ **Método 2: Mailtrap (Serviço Online)**

**O que é?** Caixa de email fake para desenvolvimento.

### **Setup:**

1. **Crie conta grátis:** https://mailtrap.io
2. **Pegue as credenciais SMTP**
3. **Configure no `application-dev.properties`:**

```properties
# Mailtrap
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=seu_username_mailtrap
spring.mail.password=sua_senha_mailtrap
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

spring.mail.from=noreply@teste.com
```

### **✅ Vantagens:**
- ✅ Não precisa instalar nada
- ✅ Interface web profissional
- ✅ Teste de spam score
- ✅ API de acesso aos emails

### **❌ Desvantagem:**
- Precisa de conta externa

---

## ✅ **Método 3: GreenMail (Em Memória)**

**O que é?** Servidor SMTP que roda dentro da aplicação Java (ideal para testes automatizados).

### **Adicionar dependência no `pom.xml`:**

```xml
<dependency>
    <groupId>com.icegreen</groupId>
    <artifactId>greenmail-spring</artifactId>
    <version>2.0.1</version>
    <scope>test</scope>
</dependency>
```

### **Configuração para testes:**

```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.mail.host=localhost",
    "spring.mail.port=3025"
})
class AuthServiceTest {
    
    private GreenMail greenMail;
    
    @BeforeEach
    void setup() {
        greenMail = new GreenMail(new ServerSetup(3025, null, "smtp"));
        greenMail.start();
    }
    
    @AfterEach
    void cleanup() {
        greenMail.stop();
    }
    
    @Test
    void testRegisterSendsEmail() {
        // Registra usuário
        authService.register(new RegisterRequest("Test", "test@test.com", "senha"));
        
        // Verifica se email foi enviado
        MimeMessage[] emails = greenMail.getReceivedMessages();
        assertEquals(1, emails.length);
        assertTrue(emails[0].getSubject().contains("Confirme seu email"));
    }
}
```

### **✅ Vantagens:**
- ✅ Perfeito para testes unitários
- ✅ Não precisa de serviço externo
- ✅ Rápido

---

## ✅ **Método 4: Log Console (Mais Simples)**

**O que é?** Em vez de enviar email, só loga no console.

### **Criar `ConsoleMailService` para DEV:**

```java
package com.demo.infrastructure.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("dev")
public class ConsoleMailService extends MailService {

    @Override
    public void sendEmail(String to, String subject, String htmlContent) {
        log.info("📧 ========== EMAIL (Console Mode) ==========");
        log.info("📬 To: {}", to);
        log.info("📝 Subject: {}", subject);
        log.info("📄 Content:\n{}", htmlContent);
        log.info("📧 ==========================================");
    }
}
```

### **Ativar no `application.yml`:**

```yaml
spring:
  profiles:
    active: dev
```

### **✅ Vantagens:**
- ✅ Mais simples possível
- ✅ Não precisa de nada externo
- ✅ Vê o HTML no console

### **❌ Desvantagem:**
- Não testa SMTP real
- Não renderiza HTML

---

## 🏆 **Recomendação Final**

### **Para o seu caso (DEV rápido):**

```yaml
🥇 MailHog (Docker)        → Melhor experiência
🥈 Mailtrap              → Se não quiser Docker
🥉 Console Log           → Mais rápido para debugar
```

---

## 🚀 **Setup Rápido com MailHog (5 minutos)**

### **1. Inicie o MailHog:**

```bash
# Windows PowerShell
docker run -d -p 1025:1025 -p 8025:8025 --name mailhog mailhog/mailhog
```

### **2. Crie `application-dev.properties`:**

```properties
# MailHog
spring.mail.host=localhost
spring.mail.port=1025
spring.mail.username=
spring.mail.password=
spring.mail.properties.mail.smtp.auth=false
spring.mail.properties.mail.smtp.starttls.enable=false
spring.mail.from=noreply@seuapp.com

# Desabilitar verificação de email
app.auth.require-email-confirmation=false
```

### **3. Teste:**

```bash
# Registrar usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@fake.com",
    "password": "senha123"
  }'

# Ver email capturado
# Abra: http://localhost:8025
```

### **4. Veja o email bonito:**

![MailHog Interface](https://github.com/mailhog/MailHog/raw/master/docs/MailHog.png)

Você verá:
- ✅ Lista de emails recebidos
- ✅ HTML renderizado
- ✅ Link de confirmação clicável
- ✅ Informações técnicas (headers, etc)

---

## 📊 **Comparação Rápida**

| Método | Complexidade | Visualização HTML | Testa SMTP Real | Offline |
|--------|--------------|-------------------|-----------------|---------|
| **MailHog** | 🟢 Baixa | ✅ Sim | ✅ Sim | ✅ Sim |
| **Mailtrap** | 🟢 Baixa | ✅ Sim | ✅ Sim | ❌ Não |
| **GreenMail** | 🟡 Média | ❌ Não | ✅ Sim | ✅ Sim |
| **Console Log** | 🟢 Baixa | ❌ Não | ❌ Não | ✅ Sim |

---

## 🎯 **Comandos Úteis**

```bash
# Iniciar MailHog
docker start mailhog

# Parar MailHog
docker stop mailhog

# Ver logs do MailHog
docker logs -f mailhog

# Remover MailHog
docker rm -f mailhog

# Acessar interface web
start http://localhost:8025  # Windows
open http://localhost:8025   # Mac
xdg-open http://localhost:8025  # Linux
```

---

## 💡 **Dica Pro:**

Para testar o **fluxo completo** (inclusive clicar no link):

1. Registre usuário
2. Vá no MailHog (http://localhost:8025)
3. Abra o email
4. **Copie o link de confirmação**
5. Cole no navegador ou faça:

```bash
# Extrair token do link e testar
curl "http://localhost:3000/api/auth/confirm-email?token=TOKEN_COPIADO"
```

---

🚀 **Escolha o MailHog e seja feliz!** É a melhor experiência de desenvolvimento para sistemas com email.
