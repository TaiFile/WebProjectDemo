# 📚 Documentação NestJS - API Completa

Bem-vindo à documentação completa do projeto NestJS. Esta documentação está organizada por módulos e funcionalidades.

## 📖 Índice

### 🚀 Instalação e Setup
- [Guia de Instalação](./INSTALACAO.md)
- [Configuração do MinIO (S3 Local)](./MINIO.md)

### 🔐 Autenticação
- [Autenticação JWT](./AUTENTICACAO_JWT.md)
- [Autenticação Keycloak](./AUTENTICACAO.md)
- [Checklist de Migração de Autenticação](./CHECKLIST_MIGRACAO.md)
- [Guia de Migração JWT](./MIGRACAO_JWT.md)

### 📍 Geolocalização
- [Geolocalização com Google Maps](./GEOLOCALIZACAO.md)

### 💳 Pagamentos
- [Testar Pagamentos - Guia Rápido](./TESTAR_PAGAMENTOS.md)
- [Testar Métodos de Pagamento (Cartão, PIX, Boleto)](./TESTAR_METODOS_PAGAMENTO.md)

### 🛠️ API Testing
- [Coleção Insomnia Completa](./insomnia_collection.json)

---

## 🏗️ Estrutura do Projeto

```
src/
├── common/              # Módulos compartilhados (guards, filters, pipes)
├── infrastructure/      # Serviços de infraestrutura
│   ├── database/       # Prisma ORM
│   ├── storage/        # S3/Local storage
│   ├── mail/           # Nodemailer
│   ├── payments/       # MercadoPago
│   └── geolocation/    # Google Maps
└── features/           # Módulos de negócio
    ├── auth/           # Autenticação JWT
    ├── users/          # Gestão de usuários
    ├── addresses/      # Endereços com geolocalização
    ├── files/          # Upload de arquivos
    ├── payments/       # Pagamentos MercadoPago
    └── products/       # CRUD de produtos
```

## 🚀 Quick Start

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

3. **Iniciar containers Docker:**
```bash
docker compose up -d
```

4. **Executar migrações:**
```bash
npx prisma migrate dev
```

5. **Iniciar servidor:**
```bash
npm run start:dev
```

## 🔗 Links Úteis

- [Documentação NestJS](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [MercadoPago Developers](https://developers.mercadopago.com)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Última atualização:** Fevereiro 2026
