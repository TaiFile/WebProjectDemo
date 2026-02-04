# Script PowerShell para gerar chaves RSA para JWT no Windows

Write-Host "Gerando chaves RSA..." -ForegroundColor Green

# Cria diretório para as chaves
$certsPath = "src\main\resources\certs"
if (-not (Test-Path $certsPath)) {
    New-Item -ItemType Directory -Path $certsPath | Out-Null
}

# Verifica se o OpenSSL está instalado
$opensslPath = "C:\Program Files\Git\usr\bin\openssl.exe"
if (-not (Test-Path $opensslPath)) {
    # Tenta encontrar o OpenSSL no PATH
    $openssl = Get-Command openssl -ErrorAction SilentlyContinue
    if ($null -eq $openssl) {
        Write-Host "❌ OpenSSL não encontrado!" -ForegroundColor Red
        Write-Host "   Instale o Git for Windows ou OpenSSL" -ForegroundColor Yellow
        Write-Host "   Git: https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
    $opensslPath = $openssl.Source
}

# Gera chave privada RSA (2048 bits)
& $opensslPath genrsa -out "$certsPath\private.pem" 2048 2>$null

# Extrai a chave pública da chave privada
& $opensslPath rsa -in "$certsPath\private.pem" -pubout -out "$certsPath\public.pem" 2>$null

Write-Host ""
Write-Host "✅ Chaves geradas com sucesso!" -ForegroundColor Green
Write-Host "   - Chave privada: $certsPath\private.pem" -ForegroundColor Cyan
Write-Host "   - Chave pública: $certsPath\public.pem" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Adicione 'src/main/resources/certs/' no .gitignore" -ForegroundColor Yellow
Write-Host "⚠️  NUNCA faça commit das chaves privadas!" -ForegroundColor Yellow
