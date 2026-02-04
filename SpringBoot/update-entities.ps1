# Script para atualizar referências às entidades do domain

$files = Get-ChildItem -Path "src\main\java" -Filter "*.java" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $modified = $false
    
    # Substituir imports
    if ($content -match "import com\.demo\.features\.users\.UserEntity;") {
        $content = $content -replace "import com\.demo\.features\.users\.UserEntity;", "import com.demo.domain.User;"
        $modified = $true
    }
    
    if ($content -match "import com\.demo\.features\.products\.ProductEntity;") {
        $content = $content -replace "import com\.demo\.features\.products\.ProductEntity;", "import com.demo.domain.Product;"
        $modified = $true
    }
    
    if ($content -match "import com\.demo\.features\.addresses\.AddressEntity;") {
        $content = $content -replace "import com\.demo\.features\.addresses\.AddressEntity;", "import com.demo.domain.Address;"
        $modified = $true
    }
    
    if ($content -match "import com\.demo\.features\.payments\.PaymentEntity;") {
        $content = $content -replace "import com\.demo\.features\.payments\.PaymentEntity;", "import com.demo.domain.Payment;"
        $modified = $true
    }
    
    if ($content -match "import com\.demo\.features\.files\.FileEntity;") {
        # FileEntity continua como FileEntity
        $content = $content -replace "import com\.demo\.features\.files\.FileEntity;", "import com.demo.domain.FileEntity;"
        $modified = $true
    }
    
    # Substituir referências nas classes
    # UserEntity -> User
    $content = $content -replace '\bUserEntity\b', 'User'
    
    # ProductEntity -> Product
    $content = $content -replace '\bProductEntity\b', 'Product'
    
    # AddressEntity -> Address
    $content = $content -replace '\bAddressEntity\b', 'Address'
    
    # PaymentEntity -> Payment (mas manter Payment.PaymentStatus)
    $content = $content -replace '\bPaymentEntity\.PaymentStatus\b', 'Payment.PaymentStatus'
    $content = $content -replace '\bPaymentEntity\b', 'Payment'
    
    # Ajustar referências fully qualified
    $content = $content -replace 'com\.demo\.features\.products\.ProductEntity', 'com.demo.domain.Product'
    $content = $content -replace 'com\.demo\.features\.addresses\.AddressEntity', 'com.demo.domain.Address'
    $content = $content -replace 'com\.demo\.features\.payments\.PaymentEntity', 'com.demo.domain.Payment'
    
    if ($modified -or ($content -ne (Get-Content $file.FullName -Raw -Encoding UTF8))) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "Atualizado: $($file.FullName)"
    }
}

Write-Host "`nConcluído!"
