# ============================================
# Build & Package Script - Azure WebJob
# ============================================
# 
# Automatiza el proceso de:
# 1. Limpiar dist/
# 2. Compilar TypeScript
# 3. Instalar dependencias de producción
# 4. Crear ZIP para Azure WebJob
#
# Uso:
#   .\build-webjob.ps1
#

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GESTIONVISITA SIMULATOR - BUILD & PACKAGE" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Variables
$ZipName = "webjob.zip"
$DistDir = "dist"
$NodeModulesDir = "node_modules"

# ============================================
# PASO 1: Limpiar compilación anterior
# ============================================
Write-Host "🧹 [1/5] Limpiando archivos anteriores..." -ForegroundColor Yellow

if (Test-Path $DistDir) {
    Remove-Item -Path $DistDir -Recurse -Force
    Write-Host "   ✅ Eliminado: $DistDir/" -ForegroundColor Green
}

if (Test-Path $ZipName) {
    Remove-Item -Path $ZipName -Force
    Write-Host "   ✅ Eliminado: $ZipName" -ForegroundColor Green
}

Write-Host ""

# ============================================
# PASO 2: Instalar dependencias de desarrollo
# ============================================
Write-Host "📦 [2/5] Instalando dependencias de desarrollo..." -ForegroundColor Yellow

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 3: Compilar TypeScript
# ============================================
Write-Host "⚙️  [3/5] Compilando TypeScript → JavaScript..." -ForegroundColor Yellow

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error en compilación" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Compilación exitosa" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 4: Instalar solo dependencias de producción
# ============================================
Write-Host "📦 [4/5] Instalando dependencias de PRODUCCIÓN..." -ForegroundColor Yellow

# Eliminar node_modules actual
if (Test-Path $NodeModulesDir) {
    Remove-Item -Path $NodeModulesDir -Recurse -Force
}

# Instalar solo producción
npm install --production --no-optional

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error instalando dependencias de producción" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Dependencias de producción instaladas" -ForegroundColor Green
Write-Host ""

# ============================================
# PASO 5: Crear ZIP para Azure WebJob
# ============================================
Write-Host "🗜️  [5/5] Creando $ZipName..." -ForegroundColor Yellow

# Verificar que existan los archivos requeridos
$RequiredFiles = @("dist", "node_modules", "package.json", "run.cmd")
$MissingFiles = @()

foreach ($file in $RequiredFiles) {
    if (-not (Test-Path $file)) {
        $MissingFiles += $file
    }
}

if ($MissingFiles.Count -gt 0) {
    Write-Host "`n❌ Faltan archivos requeridos:" -ForegroundColor Red
    $MissingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

# Crear ZIP
Compress-Archive -Path $RequiredFiles -DestinationPath $ZipName -Force

if ($LASTEXITCODE -ne 0 -and $?) {
    Write-Host "`n❌ Error creando ZIP" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ $ZipName creado exitosamente" -ForegroundColor Green
Write-Host ""

# ============================================
# Resumen
# ============================================
$ZipSize = (Get-Item $ZipName).Length / 1MB
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ BUILD COMPLETADO" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Archivo generado: $ZipName" -ForegroundColor White
Write-Host "📊 Tamaño: $([math]::Round($ZipSize, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "📋 Siguiente paso:" -ForegroundColor Yellow
Write-Host "   1. Ve al Azure Portal" -ForegroundColor White
Write-Host "   2. App Service → WebJobs → Add" -ForegroundColor White
Write-Host "   3. Sube $ZipName" -ForegroundColor White
Write-Host "   4. Type: Continuous | Scale: Single Instance" -ForegroundColor White
Write-Host ""
Write-Host "📚 Ver guía completa: DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
