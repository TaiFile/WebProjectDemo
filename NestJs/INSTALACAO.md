# 🚀 Guia de Instalação - Backend Demo NestJS

Este guia te ajudará a configurar todo o ambiente necessário para rodar o projeto.

---

## 📋 Pré-requisitos

Você precisará instalar as seguintes ferramentas:

### 1. Node.js (Obrigatório)
- **O que é:** Ambiente de execução JavaScript
- **Download:** https://nodejs.org/
- **Versão:** 18.x ou superior (recomendado LTS)

**Instalação Windows:**
1. Acesse https://nodejs.org/
2. Clique em "Download Node.js (LTS)"
3. Execute o instalador baixado
4. Siga o assistente de instalação (deixe as opções padrão)
5. Reinicie o terminal/PowerShell após a instalação

**Verificar instalação:**
```powershell
node -v
# Deve mostrar: v18.x.x ou superior

npm -v
# Deve mostrar: 9.x.x ou superior
```

---

### 2. Docker Desktop (Obrigatório)
- **O que é:** Plataforma para executar containers (PostgreSQL e Keycloak)
- **Download:** https://www.docker.com/products/docker-desktop/

**Instalação Windows:**
1. Acesse https://www.docker.com/products/docker-desktop/
2. Clique em "Download for Windows"
3. Execute o instalador
4. Após instalar, **inicie o Docker Desktop** (ícone da baleia)
5. Aguarde até o Docker ficar "running" (ícone verde)

**Verificar instalação:**
```powershell
docker -v
# Deve mostrar: Docker version 24.x.x ou superior

docker-compose -v
# Deve mostrar: Docker Compose version v2.x.x ou superior
```

⚠️ **IMPORTANTE:** O Docker Desktop precisa estar rodando sempre que você for usar o projeto!

---

## 🛠️ Configuração do Projeto

Siga estes passos **na ordem**:

### Passo 1: Abrir o Terminal na Pasta do Projeto

```powershell
# Navegue até a pasta do projeto
cd C:\Users\TaichiAdmin\OneDrive\Documentos\GitHub\BackendDemo\NestJs
```

### Passo 2: Instalar Dependências do Node.js

```powershell
# Este comando vai baixar todas as bibliotecas necessárias
# Pode demorar alguns minutos na primeira vez
npm install
```

**O que esperar:**
- Vai criar uma pasta `node_modules` (com milhares de arquivos)
- Vai criar um arquivo `package-lock.json`
- Pode demorar 2-5 minutos dependendo da sua internet

### Passo 3: Configurar Variáveis de Ambiente

```powershell
# Copiar o arquivo de exemplo para criar o .env
Copy-Item .env.example .env
```

Depois, abra o arquivo `.env` e ajuste se necessário:
- `DATABASE_URL` - já está configurado para o Docker
- `KEYCLOAK_URL` - já está configurado
- `MERCADOPAGO_ACCESS_TOKEN` - você precisará obter no site do MercadoPago (opcional para testes)
- `STORAGE_TYPE` - deixe como `local` para começar

### Passo 4: Iniciar os Containers Docker

```powershell
# Inicia o PostgreSQL e Keycloak em containers
docker-compose up -d
```

**O que acontece:**
- Baixa as imagens do PostgreSQL e Keycloak (primeira vez demora mais)
- Cria e inicia os containers
- `-d` significa "detached" (roda em background)

**Verificar se está rodando:**
```powershell
docker-compose ps
```

Deve mostrar:
```
NAME                STATUS
demo-postgres       running
demo-keycloak       running
```

### Passo 5: Aguardar o PostgreSQL Iniciar

```powershell
# Aguarde 10-15 segundos para o banco estar pronto
Start-Sleep -Seconds 15
```

Ou simplesmente aguarde uns 15 segundos antes de continuar.

### Passo 6: Gerar o Prisma Client

```powershell
# Gera o cliente do Prisma baseado no schema
npm run prisma:generate
```

### Passo 7: Criar as Tabelas no Banco de Dados

```powershell
# Executa as migrations do Prisma
npm run prisma:migrate
```

Quando pedir um nome para a migration, você pode colocar:
```
init
```

---

## 🎯 Iniciar a Aplicação

### Modo Desenvolvimento (Recomendado)

```powershell
npm run start:dev
```

**O que esperar:**
- A aplicação vai compilar
- Vai mostrar mensagens de log
- Quando ver "Application is running on: http://localhost:3000" está pronto!

### Acessar a Documentação

Abra seu navegador em:
- **Swagger (API Docs):** http://localhost:3000/api
- **Health Check:** http://localhost:3000/api/health

---

## 🔐 Configurar Keycloak (Importante!)

Para a autenticação funcionar, você precisa configurar o Keycloak:

### 1. Acessar o Keycloak
- URL: http://localhost:8080
- Login: `admin`
- Senha: `admin`

### 2. Criar um Realm
1. Clique em "Create Realm" (canto superior esquerdo)
2. Nome: `demo-realm`
3. Clique em "Create"

### 3. Criar um Client
1. No menu lateral, clique em "Clients"
2. Clique em "Create client"
3. Preencha:
   - Client ID: `demo-client`
   - Client type: `OpenID Connect`
4. Clique em "Next"
5. Em "Client authentication", deixe **OFF** (público)
6. Marque:
   - ✅ Standard flow
   - ✅ Direct access grants
7. Clique em "Next"
8. Em "Valid redirect URIs", coloque: `*` (para desenvolvimento)
9. Clique em "Save"

### 4. Criar um Usuário de Teste
1. No menu lateral, clique em "Users"
2. Clique em "Add user"
3. Preencha:
   - Username: `testuser`
   - Email: `test@example.com`
   - Email verified: **ON**
4. Clique em "Create"
5. Vá na aba "Credentials"
6. Clique em "Set password"
7. Digite uma senha (ex: `password123`)
8. Desmarque "Temporary"
9. Clique em "Save"

---

## 🧪 Testar a API

### 1. Obter Token de Autenticação

Você pode usar o Swagger ou fazer uma requisição direta:

**Via Swagger:**
1. Acesse http://localhost:3000/api
2. Clique em "Authorize" (cadeado no topo)
3. Cole um token JWT do Keycloak

**Obter token (via Postman ou curl):**
```bash
curl -X POST http://localhost:8080/realms/demo-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=demo-client" \
  -d "username=testuser" \
  -d "password=password123" \
  -d "grant_type=password"
```

### 2. Testar Endpoints

Com o token, teste os endpoints:
- `GET /api/users/me` - Ver seu perfil
- `GET /api/products` - Listar produtos
- `POST /api/files/upload` - Upload de arquivo

---

## 📦 Comandos Úteis

```powershell
# Desenvolvimento
npm run start:dev          # Inicia em modo desenvolvimento (hot-reload)
npm run start              # Inicia em modo normal
npm run build              # Compila para produção

# Prisma
npm run prisma:studio      # Abre interface visual do banco
npm run prisma:generate    # Gera Prisma Client
npm run prisma:migrate     # Cria/aplica migrations

# Docker
docker-compose up -d       # Inicia containers
docker-compose down        # Para containers
docker-compose logs -f     # Ver logs em tempo real
docker-compose ps          # Ver status dos containers

# Linting e Formatação
npm run lint               # Verifica erros de código
npm run format             # Formata o código

# Testes
npm run test               # Executa testes
npm run test:watch         # Testes em modo watch
npm run test:cov           # Testes com cobertura
```

---

## 🐛 Resolução de Problemas

### ❌ "npm: O termo 'npm' não é reconhecido"
**Problema:** Node.js não está instalado ou não está no PATH
**Solução:**
1. Instale o Node.js de https://nodejs.org/
2. Reinicie o PowerShell
3. Tente novamente

### ❌ "docker: O termo 'docker' não é reconhecido"
**Problema:** Docker não está instalado
**Solução:**
1. Instale o Docker Desktop
2. Inicie o Docker Desktop (aplicativo)
3. Aguarde ficar verde/running
4. Reinicie o PowerShell

### ❌ "Cannot connect to Docker daemon"
**Problema:** Docker Desktop não está rodando
**Solução:**
1. Inicie o Docker Desktop
2. Aguarde alguns segundos
3. Tente novamente

### ❌ "Port 5432 is already in use"
**Problema:** Já existe outro PostgreSQL rodando na porta 5432
**Solução:**
```powershell
# Ver o que está usando a porta
netstat -ano | findstr :5432

# Parar o serviço do PostgreSQL local (se houver)
Stop-Service -Name postgresql*
```

### ❌ "Error: P1001: Can't reach database server"
**Problema:** PostgreSQL ainda não iniciou completamente
**Solução:**
1. Aguarde mais alguns segundos
2. Verifique se o container está rodando: `docker-compose ps`
3. Veja os logs: `docker-compose logs postgres`

### ❌ Erros de compilação após npm install
**Problema:** Cache corrompido ou versão incompatível
**Solução:**
```powershell
# Limpar cache e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install
```

---

## 📚 Próximos Passos

Após tudo configurado:

1. ✅ Explore a documentação Swagger em http://localhost:3000/api
2. ✅ Abra o Prisma Studio: `npm run prisma:studio`
3. ✅ Configure o Keycloak para autenticação
4. ✅ Teste os endpoints de cada feature
5. ✅ Leia o código para entender a arquitetura
6. ✅ Adapte para seu projeto!

---

## 💡 Dicas

- Use o **Prisma Studio** para visualizar dados: `npm run prisma:studio`
- Configure uma **conta de teste no MercadoPago** em https://www.mercadopago.com.br/developers
- Para usar **S3**, configure as credenciais AWS no `.env` e mude `STORAGE_TYPE=s3`
- O **Swagger** é sua melhor ferramenta para testar a API

---

## 🎓 Recursos

- [Documentação NestJS](https://docs.nestjs.com/)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Keycloak](https://www.keycloak.org/documentation)
- [MercadoPago Developers](https://www.mercadopago.com.br/developers)

---

**Precisa de ajuda?** Revise os logs de erro e consulte a seção de Resolução de Problemas acima.
