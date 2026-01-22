# Script para generar hash de contraseña
# Usa el mismo algoritmo que PasswordHelper.cs

$password = "Admin123!"

# Generar salt aleatorio (32 bytes)
$salt = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($salt)

# Generar hash usando PBKDF2 con SHA256
$hash = [System.Security.Cryptography.Rfc2898DeriveBytes]::Pbkdf2(
    [System.Text.Encoding]::UTF8.GetBytes($password),
    $salt,
    100000,
    [System.Security.Cryptography.HashAlgorithmName]::SHA256,
    32
)

# Combinar salt + hash (total 64 bytes)
$hashBytes = New-Object byte[] 64
[Array]::Copy($salt, 0, $hashBytes, 0, 32)
[Array]::Copy($hash, 0, $hashBytes, 32, 32)

# Convertir a Base64
$result = [Convert]::ToBase64String($hashBytes)

# Mostrar resultado
Write-Host ""
Write-Host "============================================================"
Write-Host "GENERADOR DE HASH DE CONTRASEÑA"
Write-Host "============================================================"
Write-Host ""
Write-Host "Contraseña: $password"
Write-Host ""
Write-Host "Hash generado:"
Write-Host $result
Write-Host ""
Write-Host "Copia este hash y úsalo en el script SQL CreateAdminUser.sql"
Write-Host "============================================================"
Write-Host ""

# También escribir a un archivo
$result | Out-File -FilePath "GestionVisitaAPI/Scripts/password_hash.txt" -Encoding UTF8
Write-Host "Hash guardado en: GestionVisitaAPI/Scripts/password_hash.txt"
