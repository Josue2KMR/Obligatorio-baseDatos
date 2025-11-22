# Obligatorio Base de Datos - Sistema de Reservas UCU

Sistema de gestión de reservas de salas para la Universidad Católica del Uruguay, desarrollado con React, Flask y MySQL.

## 🚀 Inicio Rápido con Docker

### Prerrequisitos
- Docker Desktop instalado y en ejecución
- DataGrip o cliente MySQL (para ejecutar los scripts SQL)
- Git

### Instalación y Ejecución

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Obligatorio-SQL
```

2. **Levantar los contenedores**
```bash
docker-compose up --build
```

Este comando:
- Creará el contenedor de MySQL (base de datos vacía llamada `obligatorio`)
- Levantará el backend Flask en el puerto 5000
- Levantará el frontend React en el puerto 80

3. **Crear las tablas en la base de datos**

**IMPORTANTE:** Los scripts SQL en la carpeta `BaseDatos/` deben ejecutarse manualmente.

Abre DataGrip y conéctate a MySQL con estas credenciales:
- Host: `localhost`
- Puerto: `3307`
- Usuario: `root`
- Contraseña: `rootpassword`
- Base de datos: `obligatorio`

Luego ejecuta los scripts en orden:
1. `BaseDatos/01-TablasObligatorio.sql` - Crea las tablas
2. `BaseDatos/02-InsertsTablas.sql` - Inserta datos de prueba

4. **Acceder a la aplicación**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- Base de datos MySQL: localhost:3307

### Credenciales por defecto

**Base de Datos MySQL:**
- Usuario: `root`
- Contraseña: `rootpassword`
- Puerto externo: `3307` (puerto 3306 internamente en Docker)
- Base de datos: `obligatorio`

## 📦 Estructura del Proyecto

```
Obligatorio-SQL/
├── docker-compose.yml          # Orquestación de contenedores
├── BaseDatos/
│   ├── 01-TablasObligatorio.sql   # Schema de la BD
│   └── 02-InsertsTablas.sql        # Datos iniciales
├── src/
│   ├── server-flask/           # Backend Python/Flask
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── requirements.txt
│   │   ├── entrypoint.sh
│   │   └── .env               # Variables de entorno
│   └── client-react/           # Frontend React
│       ├── Dockerfile
│       ├── nginx.conf          # Configuración Nginx
│       └── src/
```

## 🛠️ Comandos Útiles

### Ver logs de los contenedores
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f db
```

### Detener los contenedores
```bash
docker-compose down
```

### Detener y eliminar volúmenes (resetear BD)
```bash
docker-compose down -v
```

### Reconstruir un servicio específico
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Acceder a la consola de un contenedor
```bash
# Backend
docker-compose exec backend sh

# Base de datos
docker-compose exec db mysql -uroot -prootpassword obligatorio
```

## 🔧 Desarrollo

### Modificar código sin reconstruir

Los volúmenes están configurados para desarrollo:
- **Backend**: Los cambios en `src/server-flask` se reflejan automáticamente
- **Frontend**: Necesitas reconstruir el contenedor (`docker-compose up --build frontend`)

### Variables de Entorno

Edita `src/server-flask/.env` para cambiar configuraciones:

```env
# Flask
SECRET_KEY=obligatorio
FLASK_DEBUG=True
FLASK_PORT=5000

# MySQL
DB_USER=root
DB_PASSWORD=rootpassword
DB_HOST=db
DB_NAME=obligatorio
DB_POOL_SIZE=5
```

## 🗄️ Base de Datos

Los scripts SQL en `BaseDatos/` se ejecutan automáticamente cuando se crea el contenedor de MySQL por primera vez:

1. `01-TablasObligatorio.sql` - Crea las tablas
2. `02-InsertsTablas.sql` - Inserta datos iniciales

Para resetear la base de datos:
```bash
docker-compose down -v
docker-compose up --build
```

## 🌐 Arquitectura

### Servicios Docker

1. **db** (MySQL 8.0)
   - Puerto: 3306
   - Volumen persistente para datos
   - Healthcheck configurado

2. **backend** (Flask/Python)
   - Puerto: 5000
   - Espera a que MySQL esté disponible
   - API REST para el frontend

3. **frontend** (React + Nginx)
   - Puerto: 80
   - Sirve la aplicación React
   - Proxy reverso para `/api` → backend

### Red Docker

Todos los servicios están en la red `obligatorio-network`, permitiendo comunicación entre contenedores usando nombres de servicio.

## 🐛 Troubleshooting

### Error: "Can't connect to MySQL server"
- Espera unos segundos más, el backend espera a que MySQL esté listo
- Verifica que el contenedor db esté saludable: `docker-compose ps`

### Error: "Port already in use"
- Cambia los puertos en `docker-compose.yml`:
  ```yaml
  ports:
    - "8080:80"  # Para frontend
    - "5001:5000"  # Para backend
  ```

### Los cambios en el frontend no se reflejan
```bash
docker-compose up --build frontend
```

### Resetear todo
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📝 Notas

- El backend usa un pool de conexiones MySQL para mejor rendimiento
- El frontend está configurado con proxy inverso en Nginx para evitar CORS
- Los datos de MySQL persisten entre reinicios gracias al volumen `db_data`
- El entrypoint del backend espera a que MySQL esté disponible antes de iniciar

## 👥 Desarrollo Local sin Docker

Si prefieres ejecutar sin Docker:

### Backend
```bash
cd src/server-flask
python -m venv venv
source venv/bin/activate  # o .\venv\Scripts\activate en Windows
pip install -r requirements.txt
# Cambiar DB_HOST=localhost en .env
python main.py
```

### Frontend
```bash
cd src/client-react
npm install
npm run dev
```

---

**Universidad Católica del Uruguay - Base de Datos I - 2024**
