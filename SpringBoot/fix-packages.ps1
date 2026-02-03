# Script para corrigir packages
$baseDir = "src\main\java\com\demo\features"

# Lista de arquivos para corrigir
$files = @(
    @{ path = "addresses\controller\AddressController.java"; old = "package com.demo.features.addresses;"; new = "package com.demo.features.addresses.controller;" },
    @{ path = "addresses\repository\AddressRepository.java"; old = "package com.demo.features.addresses;"; new = "package com.demo.features.addresses.repository;" },
    @{ path = "addresses\service\AddressService.java"; old = "package com.demo.features.addresses;"; new = "package com.demo.features.addresses.service;" },
    @{ path = "auth\controller\AuthController.java"; old = "package com.demo.features.auth;"; new = "package com.demo.features.auth.controller;" },
    @{ path = "auth\service\AuthService.java"; old = "package com.demo.features.auth;"; new = "package com.demo.features.auth.service;" },
    @{ path = "files\controller\FileController.java"; old = "package com.demo.features.files;"; new = "package com.demo.features.files.controller;" },
    @{ path = "files\repository\FileRepository.java"; old = "package com.demo.features.files;"; new = "package com.demo.features.files.repository;" },
    @{ path = "files\service\FileService.java"; old = "package com.demo.features.files;"; new = "package com.demo.features.files.service;" },
    @{ path = "payments\controller\PaymentController.java"; old = "package com.demo.features.payments;"; new = "package com.demo.features.payments.controller;" },
    @{ path = "payments\controller\WebhookController.java"; old = "package com.demo.features.payments;"; new = "package com.demo.features.payments.controller;" },
    @{ path = "payments\repository\PaymentRepository.java"; old = "package com.demo.features.payments;"; new = "package com.demo.features.payments.repository;" },
    @{ path = "payments\service\PaymentService.java"; old = "package com.demo.features.payments;"; new = "package com.demo.features.payments.service;" },
    @{ path = "products\controller\ProductController.java"; old = "package com.demo.features.products;"; new = "package com.demo.features.products.controller;" },
    @{ path = "products\repository\ProductRepository.java"; old = "package com.demo.features.products;"; new = "package com.demo.features.products.repository;" },
    @{ path = "products\service\ProductService.java"; old = "package com.demo.features.products;"; new = "package com.demo.features.products.service;" },
    @{ path = "users\controller\UserController.java"; old = "package com.demo.features.users;"; new = "package com.demo.features.users.controller;" },
    @{ path = "users\repository\UserRepository.java"; old = "package com.demo.features.users;"; new = "package com.demo.features.users.repository;" },
    @{ path = "users\service\UserDetailsServiceImpl.java"; old = "package com.demo.features.users;"; new = "package com.demo.features.users.service;" },
    @{ path = "users\service\UserService.java"; old = "package com.demo.features.users;"; new = "package com.demo.features.users.service;" }
)

foreach ($file in $files) {
    $fullPath = "$baseDir\$($file.path)"
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $content = $content -replace [regex]::Escape($file.old), $file.new
        [System.IO.File]::WriteAllText((Resolve-Path $fullPath).Path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Atualizado package: $($file.path)"
    } else {
        Write-Host "Arquivo nao encontrado: $fullPath"
    }
}

Write-Host "`nAtualizando imports..."

# Atualizar imports em todos os arquivos Java
Get-ChildItem -Path "src\main\java\com\demo" -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    # Atualizar imports de repositories
    $content = $content -replace "import com\.demo\.features\.users\.UserRepository;", "import com.demo.features.users.repository.UserRepository;"
    $content = $content -replace "import com\.demo\.features\.products\.ProductRepository;", "import com.demo.features.products.repository.ProductRepository;"
    $content = $content -replace "import com\.demo\.features\.addresses\.AddressRepository;", "import com.demo.features.addresses.repository.AddressRepository;"
    $content = $content -replace "import com\.demo\.features\.payments\.PaymentRepository;", "import com.demo.features.payments.repository.PaymentRepository;"
    $content = $content -replace "import com\.demo\.features\.files\.FileRepository;", "import com.demo.features.files.repository.FileRepository;"
    
    # Atualizar imports de services
    $content = $content -replace "import com\.demo\.features\.auth\.AuthService;", "import com.demo.features.auth.service.AuthService;"
    $content = $content -replace "import com\.demo\.features\.users\.UserService;", "import com.demo.features.users.service.UserService;"
    $content = $content -replace "import com\.demo\.features\.users\.UserDetailsServiceImpl;", "import com.demo.features.users.service.UserDetailsServiceImpl;"
    $content = $content -replace "import com\.demo\.features\.products\.ProductService;", "import com.demo.features.products.service.ProductService;"
    $content = $content -replace "import com\.demo\.features\.addresses\.AddressService;", "import com.demo.features.addresses.service.AddressService;"
    $content = $content -replace "import com\.demo\.features\.payments\.PaymentService;", "import com.demo.features.payments.service.PaymentService;"
    $content = $content -replace "import com\.demo\.features\.files\.FileService;", "import com.demo.features.files.service.FileService;"
    
    # Atualizar imports de controllers
    $content = $content -replace "import com\.demo\.features\.auth\.AuthController;", "import com.demo.features.auth.controller.AuthController;"
    $content = $content -replace "import com\.demo\.features\.users\.UserController;", "import com.demo.features.users.controller.UserController;"
    $content = $content -replace "import com\.demo\.features\.products\.ProductController;", "import com.demo.features.products.controller.ProductController;"
    $content = $content -replace "import com\.demo\.features\.addresses\.AddressController;", "import com.demo.features.addresses.controller.AddressController;"
    $content = $content -replace "import com\.demo\.features\.payments\.PaymentController;", "import com.demo.features.payments.controller.PaymentController;"
    $content = $content -replace "import com\.demo\.features\.files\.FileController;", "import com.demo.features.files.controller.FileController;"
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($_.FullName, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Atualizado imports: $($_.Name)"
    }
}

Write-Host "`nConcluido!"
