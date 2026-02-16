# ============================================
# Quick Test Script - Simulador Local
# ============================================
#
# Prueba rápida del simulador contra backend local
# 
# Uso:
#   .\test-local.ps1
#

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SIMULADOR - QUICK TEST (Local)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# ============================================
# Pre-checks
# ============================================
Write-Host "🔍 Verificando requisitos..." -ForegroundColor Yellow

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no encontrado. Instala Node.js 18+" -ForegroundColor Red
    exit 1
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "`n⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "   Creando desde .env.local.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env"
        Write-Host "   ✅ Creado .env" -ForegroundColor Green
        Write-Host "`n   📝 IMPORTANTE: Edita .env con tus credenciales locales" -ForegroundColor Cyan
        Write-Host "      - API_BASE_URL (ej: http://localhost:5000)" -ForegroundColor White
        Write-Host "      - AUTH_EMAIL" -ForegroundColor White
        Write-Host "      - AUTH_PASSWORD" -ForegroundColor White
        Write-Host "`n   Presiona Enter cuando hayas configurado .env..."
        Read-Host
    } else {
        Write-Host "   ❌ No se encontró .env.local.example" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow
npm install --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green

# ============================================
# Test de configuración
# ============================================
Write-Host "`n⚙️  Cargando configuración..." -ForegroundColor Yellow

# Leer .env
$env:NODE_ENV = "development"
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

Write-Host "   API_BASE_URL: $env:API_BASE_URL" -ForegroundColor White
Write-Host "   AUTH_EMAIL: $env:AUTH_EMAIL" -ForegroundColor White
Write-Host "   SIMULATION_SPEED: $env:SIMULATION_SPEED" -ForegroundColor White

# ============================================
# Test de conectividad
# ============================================
Write-Host "`n🌐 Probando conexión con backend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$env:API_BASE_URL/api/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend respondiendo: HTTP $($response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend respondió con: HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ No se pudo conectar al backend" -ForegroundColor Red
    Write-Host "   Asegúrate que el backend esté corriendo en: $env:API_BASE_URL" -ForegroundColor Yellow
    Write-Host "`n   Continuar de todas formas? (S/N): " -NoNewline
    $continue = Read-Host
    if ($continue -ne "S" -and $continue -ne "s") {
        exit 1
    }
}

# ============================================
# Ejecutar simulador
# ============================================
Write-Host "`n🚀 Iniciando simulador..." -ForegroundColor Yellow
Write-Host "   (Presiona Ctrl+C para detener)" -ForegroundColor Gray
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Ejecutar con ts-node
npm run dev

# Si se detuvo
Write-Host "`n"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Simulador detenido" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"
