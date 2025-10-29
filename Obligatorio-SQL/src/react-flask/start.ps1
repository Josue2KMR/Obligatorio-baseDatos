Write-Host "=== Iniciando Aplicacion ===" -ForegroundColor Yellow

Write-Host "[1/2] Iniciando Flask Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'FLASK SERVER' -ForegroundColor Green; cd '$PSScriptRoot\server-flask'; .\venv\Scripts\Activate.ps1; `$env:FLASK_ENV='development'; python main.py"
)

Start-Sleep -Seconds 3

Write-Host "[2/2] Iniciando React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host 'REACT APP' -ForegroundColor Cyan; cd '$PSScriptRoot\client-react'; npm run dev"
)

Write-Host "`n=== Servidores iniciados ===" -ForegroundColor Green
Write-Host "Flask: http://localhost:5000/api/reservas" -ForegroundColor Green
Write-Host "React: http://localhost:5173" -ForegroundColor Cyan