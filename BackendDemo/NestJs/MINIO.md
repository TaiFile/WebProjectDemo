# 🪣 MinIO - S3-Compatible Storage Local

MinIO está configurado para simular o AWS S3 localmente durante o desenvolvimento.

## 🚀 Como usar

### 1️⃣ Iniciar MinIO

```bash
docker-compose up -d minio
```

### 2️⃣ Acessar o Console Web

- **URL**: http://localhost:9001
- **Login**: `minioadmin`
- **Senha**: `minioadmin123`

### 3️⃣ Criar o Bucket

No console web do MinIO:

1. Acesse **Buckets** no menu lateral
2. Clique em **Create Bucket**
3. Nome: `demo-bucket`
4. Clique em **Create Bucket**

Ou via CLI:

```bash
# Instalar MinIO Client (mc)
# Windows (Chocolatey): choco install minio-client
# macOS: brew install minio/stable/mc
# Linux: wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Configurar alias
mc alias set local http://localhost:9000 minioadmin minioadmin123

# Criar bucket
mc mb local/demo-bucket
```

### 4️⃣ Configurar o Backend

No arquivo `.env`:

```env
# Mudar para S3 storage
STORAGE_TYPE=s3

# Configurações do MinIO
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
AWS_S3_BUCKET=demo-bucket
AWS_ENDPOINT=http://localhost:9000
```

### 5️⃣ Reiniciar o Backend

```bash
npm run start:dev
```

Pronto! Agora o backend vai usar o MinIO como storage.

---

## 📊 Verificar Arquivos Armazenados

### Via Console Web

1. Acesse http://localhost:9001
2. Vá em **Buckets** → `demo-bucket`
3. Veja todos os arquivos armazenados

### Via MinIO Client (CLI)

```bash
# Listar arquivos no bucket
mc ls local/demo-bucket

# Download de arquivo
mc cp local/demo-bucket/arquivo.txt ./

# Delete arquivo
mc rm local/demo-bucket/arquivo.txt
```

---

## 🔄 Testar Upload/Download

### 1. Upload

```bash
POST http://localhost:3000/api/files/upload
Authorization: Bearer <seu-token>
Content-Type: multipart/form-data

file: <selecione um arquivo>
```

### 2. Verificar no MinIO

Acesse o console e veja o arquivo em `demo-bucket`

### 3. Download

```bash
GET http://localhost:3000/api/files/<file-id>/download
Authorization: Bearer <seu-token>
```

---

## 🛠️ Comandos Úteis

```bash
# Ver logs do MinIO
docker logs -f demo-minio

# Parar MinIO
docker-compose stop minio

# Reiniciar MinIO
docker-compose restart minio

# Remover dados do MinIO (cuidado!)
docker-compose down -v
```

---

## 🔧 Migrar de Local para MinIO

1. Mude `STORAGE_TYPE=s3` no `.env`
2. Configure as credenciais do MinIO
3. Reinicie o backend
4. Novos uploads vão para o MinIO
5. Arquivos antigos (local) continuam acessíveis pelo path

---

## ⚠️ Notas Importantes

- **Desenvolvimento**: Use MinIO para simular S3
- **Produção**: Mude `AWS_ENDPOINT` para vazio e use AWS S3 real
- **Credenciais**: Troque `minioadmin/minioadmin123` em produção
- **Bucket**: Crie o bucket manualmente antes de usar

---

## 🌐 Migrar para AWS S3 Real

Quando for para produção:

```env
# .env (produção)
STORAGE_TYPE=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<sua-key-da-aws>
AWS_SECRET_ACCESS_KEY=<sua-secret-da-aws>
AWS_S3_BUCKET=<seu-bucket-real>
AWS_ENDPOINT=  # Deixe vazio para usar AWS S3
```

O código funciona igual! Só muda as credenciais.
