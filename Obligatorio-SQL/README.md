# OneRoom UCU — Proyecto de Reserva de Salas

Descripción
- Proyecto web para gestionar reservas de salas de estudio: Frontend en React, Backend en Flask y base de datos MySQL.

Resumen de cambios desde el último commit
- `src/client-react/src/App.jsx` (M): Navegación y detección de usuario administrador; control de secciones principales.
- `src/client-react/src/pages/Admin.jsx` (A): Nuevo panel de administración (gestión de salas, usuarios y sanciones).
- `src/client-react/src/pages/Dashboard.jsx` (M): Nuevas llamadas a API para estadísticas y reportes (salas más reservadas, reservas del día, ocupación).
- `src/client-react/src/pages/Profile.jsx` (M): Mejoras en perfil de usuario, cancelación de reservas y opción de eliminación en cascada de cuenta.
- `src/client-react/src/pages/Reservar.jsx` (M): Formulario de reservas con validaciones, selección de sala/turno y resumen.
- `src/client-react/src/styles.css` (M): Actualizaciones de estilos para nuevas vistas y componentes.
- `src/server-flask/main.py` (M): Nuevos endpoints y mejoras en la lógica (login/registro, participante, salas, eliminación en cascada, reportes).
- `src/start.ps1` (M): Script PowerShell mejorado para preparar y lanzar backend y frontend.

Notas importantes
- Antes de ejecutar, revisa `src/server-flask/config.py` para configurar la conexión a la base de datos.
- Los scripts SQL para crear las tablas están en la carpeta `BaseDatos/` (`TablasObligatorio.sql`, `InsertsTablas.sql`).

Ejecución local (PowerShell)

Requisitos
- Python 3.8+ y `pip`
- Node.js y `npm`
- MySQL con las tablas del proyecto

Arranque automático (recomendado)
```powershell
# Desde la raíz del repositorio
Set-Location -LiteralPath "C:\Users\Usuario\OneDrive\Escritorio\Universidad\Semestre IV\Base de Datos I\Obligatorio-baseDatos\Obligatorio-SQL"

# Ejecuta el script que prepara y abre las consolas para Flask y React
.\src\start.ps1
```

Pasos manuales (alternativa)
```powershell
# Backend (Flask)
Set-Location -LiteralPath .\src\server-flask
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
.\venv\Scripts\python.exe main.py

# Frontend (React) - en otra terminal
Set-Location -LiteralPath .\src\client-react
npm install
npm run dev
```

Comandos PowerShell para subir cambios a Git

Añadir solo el README:
```powershell
Set-Location -LiteralPath "C:\Users\Usuario\OneDrive\Escritorio\Universidad\Semestre IV\Base de Datos I\Obligatorio-baseDatos\Obligatorio-SQL"

git add README.md
git commit -m "docs: add README with recent changes summary"
# Empuja a la rama actual
git push origin $(git branch --show-current)
```

Añadir todos los cambios:
```powershell
Set-Location -LiteralPath "C:\Users\Usuario\OneDrive\Escritorio\Universidad\Semestre IV\Base de Datos I\Obligatorio-baseDatos\Obligatorio-SQL"

git status
git add .
git commit -m "feat: upload recent changes and add README"
git push origin $(git branch --show-current)
```

Consejos y siguientes pasos
- Verifica la rama con `git branch --show-current`. Si necesitas cambiarla, usa `git switch <rama>`.
- Asegúrate de configurar correctamente `config.py` (datos de conexión a MySQL) antes de probar la aplicación.
- Si quieres, puedo hacer el commit y push por ti (indícame el mensaje y la rama).

Archivo creado:
- `README.md` en la raíz del proyecto

Si quieres que haga el commit y push ahora, dime el mensaje de commit y la rama destino.
