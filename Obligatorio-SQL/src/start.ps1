# Script mejorado para iniciar Flask y React
# Verifica permisos y dependencias antes de iniciar

Write-Host "=== Verificando Sistema ===" -ForegroundColor Yellow

# Verificar política de ejecución
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "Restricted" -or $policy -eq "AllSigned") {
    Write-Host "ERROR: La política de ejecución está muy restrictiva." -ForegroundColor Red
    Write-Host "Solución: Ejecuta PowerShell como Administrador y corre:" -ForegroundColor Yellow
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Política de ejecución: OK" -ForegroundColor Green

# Verificar venv de Flask
$flaskPath = Join-Path $PSScriptRoot "server-flask"
$venvPath = Join-Path $flaskPath "venv\Scripts\python.exe"

# Verificar que Python esté disponible
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "ERROR: Python no está disponible en PATH. Instala Python o añádelo al PATH." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}
if (-not (Test-Path $venvPath)) {
    Write-Host "ERROR: No se encuentra el entorno virtual de Flask" -ForegroundColor Red
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    
    Push-Location $flaskPath
    python -m venv venv
    # Instalar dependencias: preferir requirements.txt si existe
    if (Test-Path (Join-Path $flaskPath "requirements.txt")) {
        & ".\venv\Scripts\pip.exe" install -r requirements.txt
    }
    else {
        & ".\venv\Scripts\pip.exe" install flask flask-cors
    }
    Pop-Location
    
    Write-Host "Entorno virtual creado e instalado" -ForegroundColor Green
}

# Verificar node_modules de React
$reactPath = Join-Path $PSScriptRoot "client-react"
$nodeModulesPath = Join-Path $reactPath "node_modules"

# Verificar que Node/npm esté disponible
$nodeCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "ADVERTENCIA: Node/NPM no está en PATH. React no podrá iniciarse automáticamente." -ForegroundColor Yellow
}
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "ADVERTENCIA: No se encuentra node_modules en React" -ForegroundColor Yellow
    if (Test-Path (Join-Path $reactPath "package.json")) {
        $choice = Read-Host "Deseas ejecutar 'npm install' en $reactPath ahora? (Y/N)"
        if ($choice -match '^[Yy]') {
            Push-Location $reactPath
            if (Test-Path (Join-Path $reactPath "package-lock.json")) {
                npm ci
            }
            else {
                npm install
            }
            Pop-Location
        }
        else {
            Write-Host "Salteado 'npm install'. Ejecuta 'npm install' antes de iniciar React." -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "No se encontró 'package.json' en $reactPath. Imposible instalar dependencias automáticamente." -ForegroundColor Yellow
    }
}

Write-Host "`n=== Iniciando Aplicación ===" -ForegroundColor Yellow

# Iniciar Flask Backend
Write-Host "[1/2] Iniciando Flask Backend..." -ForegroundColor Green
$flaskTemp = Join-Path $env:TEMP ("start_flask_{0}.ps1" -f ([guid]::NewGuid().ToString()))
$flaskScript = @"
Write-Host 'FLASK SERVER' -ForegroundColor Green
Set-Location -LiteralPath "$flaskPath"
& '.\venv\Scripts\python.exe' main.py
Read-Host 'Presiona Enter para cerrar'
"@
$flaskScript | Out-File -FilePath $flaskTemp -Encoding UTF8

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $flaskTemp
)

Start-Sleep -Seconds 3

# Iniciar React Frontend
Write-Host "[2/2] Iniciando React Frontend..." -ForegroundColor Cyan
$reactTemp = Join-Path $env:TEMP ("start_react_{0}.ps1" -f ([guid]::NewGuid().ToString()))
$reactScript = @"
Write-Host 'REACT APP' -ForegroundColor Cyan
Set-Location -LiteralPath "$reactPath"
npm run dev
Read-Host 'Presiona Enter para cerrar'
"@
$reactScript | Out-File -FilePath $reactTemp -Encoding UTF8

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-File", $reactTemp
)

Write-Host "`n=== Servidores Iniciados ===" -ForegroundColor Green
Write-Host "Flask: http://localhost:5000/api/reservas" -ForegroundColor Green
Write-Host "React: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPresiona Ctrl+C en cada ventana para detener los servidores" -ForegroundColor Yellow