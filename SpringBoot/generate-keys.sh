#!/bin/bash

# Script para gerar chaves RSA para JWT

echo "Gerando chaves RSA..."

# Cria diretório para as chaves
mkdir -p src/main/resources/certs

# Gera chave privada RSA (2048 bits)
openssl genrsa -out src/main/resources/certs/private.pem 2048

# Extrai a chave pública da chave privada
openssl rsa -in src/main/resources/certs/private.pem -pubout -out src/main/resources/certs/public.pem

echo "✅ Chaves geradas com sucesso!"
echo "   - Chave privada: src/main/resources/certs/private.pem"
echo "   - Chave pública: src/main/resources/certs/public.pem"
echo ""
echo "⚠️  IMPORTANTE: Adicione 'src/main/resources/certs/' no .gitignore"
echo "⚠️  NUNCA faça commit das chaves privadas!"
