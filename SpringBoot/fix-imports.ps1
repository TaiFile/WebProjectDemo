# Script para adicionar imports faltantes
$baseDir = "src\main\java\com\demo\features"

$filesToFix = @(
    @{ file = "$baseDir\users\service\UserDetailsServiceImpl.java"; import = "import com.demo.features.users.repository.UserRepository;" },
    @{ file = "$baseDir\users\service\UserService.java"; import = "import com.demo.features.users.repository.UserRepository;" },
    @{ file = "$baseDir\users\controller\UserController.java"; import = "import com.demo.features.users.service.UserService;" },
    @{ file = "$baseDir\addresses\service\AddressService.java"; import = "import com.demo.features.addresses.repository.AddressRepository;" },
    @{ file = "$baseDir\addresses\controller\AddressController.java"; import = "import com.demo.features.addresses.service.AddressService;" },
    @{ file = "$baseDir\auth\controller\AuthController.java"; import = "import com.demo.features.auth.service.AuthService;" },
    @{ file = "$baseDir\files\service\FileService.java"; import = "import com.demo.features.files.repository.FileRepository;" },
    @{ file = "$baseDir\files\controller\FileController.java"; import = "import com.demo.features.files.service.FileService;" },
    @{ file = "$baseDir\payments\service\PaymentService.java"; import = "import com.demo.features.payments.repository.PaymentRepository;" },
    @{ file = "$baseDir\payments\controller\PaymentController.java"; import = "import com.demo.features.payments.service.PaymentService;" },
    @{ file = "$baseDir\payments\controller\WebhookController.java"; import = "import com.demo.features.payments.service.PaymentService;" },
    @{ file = "$baseDir\products\service\ProductService.java"; import = "import com.demo.features.products.repository.ProductRepository;" },
    @{ file = "$baseDir\products\controller\ProductController.java"; import = "import com.demo.features.products.service.ProductService;" }
)

foreach ($fix in $filesToFix) {
    if (Test-Path $fix.file) {
        $content = Get-Content $fix.file -Raw
        if (-not $content.Contains($fix.import)) {
            $content = $content -replace "(package [^;]+;)", "`$1`n`n$($fix.import)"
            [System.IO.File]::WriteAllText((Resolve-Path $fix.file).Path, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "Adicionado import em: $($fix.file)"
        } else {
            Write-Host "Import ja existe em: $($fix.file)"
        }
    } else {
        Write-Host "Arquivo nao encontrado: $($fix.file)"
    }
}
Write-Host "Concluido!"
