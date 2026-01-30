# ✅ Checklist de Migração: Keycloak → JWT

Siga estes passos para completar a migração com sucesso.

## 📋 Checklist de Migração

### 🔧 Pré-requisitos
- [ ] Git atualizado com as mudanças
- [ ] Não há código referenciando `@infrastructure/keycloak` em outros arquivos
- [ ] Backup do banco de dados (opcional, mas recomendado)

### 🛠️ Setup Inicial
- [ ] Copiar `.env.example` para `.env`
- [ ] Gerar `JWT_SECRET` seguro (32 caracteres)
- [ ] Preencher `JWT_EXPIRES_IN` (padrão: "24h")
- [ ] Preencher `FRONTEND_URL` (padrão: "http://localhost:3000")
- [ ] Verificar `DATABASE_URL` está correto

**Gerar JWT_SECRET:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

### 📦 Dependências
- [ ] Executar `npm install`
- [ ] Verificar se `node_modules` foi atualizado
- [ ] Verificar se não há erros de resolução

### 🗄️ Banco de Dados
- [ ] Docker PostgreSQL está rodando: `docker-compose up -d`
- [ ] Executar `npm run prisma:generate`
- [ ] Executar `npm run prisma:migrate`
- [ ] Validar que a migração executou sem erros

**Verificar dados (opcional):**
```bash
npm run prisma:studio
```

### 🚀 Backend
- [ ] Executar `npm run start:dev`
- [ ] Verificar se não há erros na inicialização
- [ ] Checar se porta 3000 está disponível

### 🧪 Testes
- [ ] Registrar novo usuário (POST /auth/register)
- [ ] Pegar token do console
- [ ] Confirmar email (POST /auth/confirm-email)
- [ ] Fazer login (POST /auth/login)
- [ ] Usar token em GET /users/me
- [ ] Atualizar perfil (PATCH /users/me)

### 📝 Documentação
- [ ] Ler `AUTENTICACAO_JWT.md`
- [ ] Ler `MIGRACAO_JWT.md`
- [ ] Entender o fluxo de autenticação

### 🔍 Validações Finais
- [ ] Nenhum erro no console do backend
- [ ] Nenhum erro no console do browser (se teste com frontend)
- [ ] Tokens sendo gerados corretamente
- [ ] Email de confirmação aparecendo no console

---

## 🚨 Troubleshooting

### Erro: `JWT_SECRET não definida`
**Solução:**
```bash
# Verificar .env
cat .env | grep JWT_SECRET

# Se vazio, gerar novo:
# JWT_SECRET="<copiar resultado do comando acima>"
```

### Erro: `Conexão ao banco negada`
**Solução:**
```bash
# Verificar se Docker está rodando
docker ps | grep demo-postgres

# Se não aparecer, iniciar:
docker-compose up -d

# Verificar DATABASE_URL
echo $DATABASE_URL
```

### Erro: `Migrations failed`
**Solução:**
```bash
# Reset no development (CUIDADO: deleta dados!)
npm run prisma:migrate:reset

# Ou limpar manualmente:
npm run prisma:studio
# Deletar registros com botão de delete
```

### Erro: `Token inválido`
**Solução:**
- Verificar se `JWT_SECRET` é o mesmo em `.env`
- Regenerar token fazendo novo login
- Token expira em 24h (padrão)

### Erro: `Email não confirmado`
**Solução:**
- Checar console do backend para pegar token
- Chamar `/auth/confirm-email` com token
- Depois tentar login novamente

---

## 📊 Comparação de Arquitetura

### Antes (Keycloak)
```
Frontend → Keycloak ← Backend (valida JWKS)
```

### Depois (JWT)
```
Frontend → Backend ← (gera JWT com SECRET)
```

---

## 🔐 Segurança

### Checklist de Segurança
- [ ] JWT_SECRET não é versionado no Git (no .gitignore)
- [ ] JWT_SECRET é diferente em produção
- [ ] Senhas são hasheadas com bcrypt
- [ ] Email precisa ser confirmado para login
- [ ] Token expira automaticamente

### Produão (Próximos Passos)
- [ ] Usar HTTPS
- [ ] JWT_SECRET gerado via variável de ambiente
- [ ] Implementar CORS corretamente
- [ ] Rate limiting em /auth/login
- [ ] Logs de autenticação

---

## 📚 Recursos Úteis

| Recurso | Link |
|---------|------|
| JWT Payload Decoder | https://jwt.io |
| Gerador de Senhas | https://www.uuidgenerator.net/ |
| Documentação NestJS JWT | https://docs.nestjs.com/security/authentication |
| Passport Strategies | https://www.passportjs.org/packages/passport-jwt/ |

---

## ⏭️ Próximas Features

### Curto Prazo (Importante)
- [ ] Integrar serviço real de email (SendGrid, Mailgun)
- [ ] Implementar Password Reset
- [ ] Melhorar validação de senha (força de senha)

### Médio Prazo (Recomendado)
- [ ] Refresh Token
- [ ] Email verification reminder
- [ ] Account lockout (depois de 5 tentativas)

### Longo Prazo (Opcional)
- [ ] OAuth2 (Google, GitHub login)
- [ ] 2FA (Two Factor Authentication)
- [ ] Social Login
- [ ] Session management

---

## 💬 Dúvidas Comuns

**P: Perdi o token de confirmação de email, como reseto?**
A: Por enquanto, precisa contatar admin. TODO: Implementar "Resend confirmation email"

**P: Como fazer logout?**
A: JWT é stateless. Logout é apenas remover token no frontend.

**P: Posso mudar JWT_SECRET depois?**
A: Não, todos os tokens existentes ficarão inválidos.

**P: Quanto tempo dura o token?**
A: Padrão 24h (configurável em JWT_EXPIRES_IN)

**P: E se alguém roubar meu token?**
A: Use HTTPS, armazene em cookie HttpOnly, implemente refresh tokens.

---

## ✨ Conclusão

Parabéns! Você removeu o Keycloak e implementou JWT com sucesso. 

**Benefícios:**
- ✅ Setup mais simples
- ✅ Menos dependências
- ✅ Mais control sobre autenticação
- ✅ Mais rápido de deployar

**Próximo:** Implementar serviço de email real!
