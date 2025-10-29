# Obligatorio-baseDatos

# Gestión de Participantes - Aplicación Full Stack

Aplicación web para gestionar participantes utilizando **React** en el frontend y **Flask + MySQL** en el backend.

---

## 🚀 Ejecutar la Aplicación

### Paso 1: Navegar a la carpeta principal

Abre PowerShell o Terminal y navega hasta la carpeta del proyecto:

```bash
cd Obligatorio-SQL/src/react-flask
```

### Paso 2: Habilitar ejecución de scripts (Solo la primera vez en Windows)

Si es tu primera vez ejecutando el script en PowerShell, necesitas habilitar la ejecución de scripts:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Te preguntará si estás seguro, escribe `S` (Sí) y presiona Enter.

### Paso 3: Ejecutar el script de inicio

**En Windows (PowerShell):**
```powershell
.\start.ps1
```

**En Linux/Mac:**

Primero dale permisos de ejecución (solo la primera vez):
```bash
chmod +x start.sh
```

Luego ejecuta:
```bash
./start.sh
```

### Paso 4: Verificar que todo funciona

Se abrirán **2 ventanas nuevas**:

- **Ventana Flask (Verde)**: Backend corriendo en `http://localhost:5000`
- **Ventana React (Cyan)**: Frontend corriendo en `http://localhost:5173`

Abre tu navegador en la URL de React que aparece en la terminal cyan.

---

## 🔄 Detener los Servidores

Para detener ambos servidores:
- Ve a cada ventana abierta y presiona `Ctrl + C`
- O simplemente cierra las ventanas

---

## 🛠️ Solución de Problemas

### Error: "scripts is disabled on this system"
Ejecuta este comando en PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Port 5000 already in use"
Otro proceso está usando el puerto 5000. Ciérralo o identifícalo con:
```powershell
# Windows
netstat -ano | findstr :5000

# Linux/Mac
lsof -i :5000
```

### Los servidores no se inician
Verifica que las dependencias estén instaladas:
- **Python**: El entorno virtual debe existir en `server-flask/venv/`
- **React**: Las dependencias deben estar en `client-react/node_modules/`