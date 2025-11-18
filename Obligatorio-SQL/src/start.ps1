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

if (-not (Test-Path $venvPath)) {
    Write-Host "ERROR: No se encuentra el entorno virtual de Flask" -ForegroundColor Red
    Write-Host "Creando entorno virtual..." -ForegroundColor Yellow
    
    Push-Location $flaskPath
    python -m venv venv
    & ".\venv\Scripts\pip.exe" install flask flask-cors
    Pop-Location
    
    Write-Host "Entorno virtual creado e instalado" -ForegroundColor Green
}

# Verificar node_modules de React
$reactPath = Join-Path $PSScriptRoot "client-react"
$nodeModulesPath = Join-Path $reactPath "node_modules"

if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "ADVERTENCIA: No se encuentra node_modules en React" -ForegroundColor Yellow
    Write-Host "Ejecuta 'npm install' en $reactPath" -ForegroundColor Yellow
}

Write-Host "`n=== Iniciando Aplicación ===" -ForegroundColor Yellow

# Iniciar Flask Backend
Write-Host "[1/2] Iniciando Flask Backend..." -ForegroundColor Green
$flaskScript = @"
Write-Host 'FLASK SERVER' -ForegroundColor Green
cd '$flaskPath'
& '.\venv\Scripts\python.exe' main.py
Read-Host 'Presiona Enter para cerrar'
"@

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $flaskScript
)

Start-Sleep -Seconds 3

# Iniciar React Frontend
Write-Host "[2/2] Iniciando React Frontend..." -ForegroundColor Cyan
$reactScript = @"
Write-Host 'REACT APP' -ForegroundColor Cyan
cd '$reactPath'
npm run dev
Read-Host 'Presiona Enter para cerrar'
"@

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", $reactScript
)

Write-Host "`n=== Servidores Iniciados ===" -ForegroundColor Green
Write-Host "Flask: http://localhost:5000/api/reservas" -ForegroundColor Green
Write-Host "React: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nPresiona Ctrl+C en cada ventana para detener los servidores" -ForegroundColor Yellow