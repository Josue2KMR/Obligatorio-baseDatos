# Sistema de Reservas UCU - OneRoom

Sistema integral de gestión de reservas de salas de estudio para la Universidad Católica del Uruguay. Desarrollado con arquitectura moderna utilizando Docker, React, Flask y MySQL.

---

## Integrantes del Equipo

- **Josue Merino**
- **Mateo Cimassi**
- **Joaquín García**

**Universidad:** Universidad Católica del Uruguay  
**Curso:** Base de Datos I - Semestre IV  
**Año:** 2025

---

## Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso del Sistema](#-uso-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Base de Datos](#-base-de-datos)
- [API Endpoints](#-api-endpoints)
- [Características Principales](#-características-principales)
- [Desarrollo](#-desarrollo)
- [Solución de Problemas](#-solución-de-problemas)

---

## Descripción del Proyecto

OneRoom es una aplicación web completa para la gestión de reservas de salas de estudio en la UCU. El sistema permite a los estudiantes reservar espacios, consultar disponibilidad en tiempo real, y a los administradores gestionar salas, usuarios y generar reportes estadísticos.

### Funcionalidades Principales

 **Para Usuarios:**
- Registro e inicio de sesión con autenticación segura
- Reserva de salas por fecha y turno
- Visualización de estado de salas en tiempo real
- Gestión de reservas personales (cancelación, consulta)
- Panel de perfil con historial de reservas y sanciones

 **Para Administradores:**
- Panel de administración completo
- Gestión de salas (crear, editar, eliminar)
- Gestión de usuarios y sanciones
- Dashboard con 12+ reportes estadísticos en tiempo real
- Análisis de ocupación, demanda y uso de instalaciones

---

## Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de interfaz de usuario
- **Vite** - Build tool y dev server
- **CSS3** - Estilos personalizados con paleta UCU

### Backend
- **Flask 3.0** - Framework web de Python
- **Flask-CORS** - Manejo de CORS
- **MySQL Connector** - Driver de base de datos con pool de conexiones

### Base de Datos
- **MySQL 8.0** - Sistema de gestión de base de datos
- **Charset UTF-8mb4** - Soporte completo de caracteres Unicode

### DevOps & Infraestructura
- **Docker & Docker Compose** - Contenedorización y orquestación
- **Nginx** - Servidor web para producción (frontend)
- **Git** - Control de versiones

---

## Arquitectura del Sistema

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   Base de       │
│   React + Vite  │─────▶│  Flask + Python │─────▶│   Datos MySQL   │
│   Port 80       │      │    Port 5000    │      │   Port 3307     │
│   (Nginx)       │◀─────│                 │◀─────│                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                      Docker Network (Bridge)
```

**Flujo de Datos:**
1. Usuario accede a http://localhost
2. Nginx sirve la aplicación React (SPA)
3. React hace peticiones HTTP a http://localhost:5000/api
4. Flask procesa la lógica de negocio
5. MySQL almacena y consulta datos
6. Respuesta JSON al frontend

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Docker Desktop** (v20.10+)
  - Windows: [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Verificar: `docker --version` y `docker-compose --version`

- **Git** (v2.30+)
  - [Descargar Git](https://git-scm.com/downloads)
  - Verificar: `git --version`

> **Nota:** Docker Desktop incluye Docker Compose. No se requiere instalación separada de Node.js, Python o MySQL ya que están contenidos en Docker.

---

## Instalación y Configuración

### 1️⃣ Clonar el Repositorio

```powershell
# Clonar el repositorio
git clone https://github.com/Josue2KMR/Obligatorio-baseDatos.git

# Navegar al directorio
cd Obligatorio-baseDatos/Obligatorio-SQL
```

### 2️⃣ Configurar Variables de Entorno (Opcional)

El sistema funciona con configuración por defecto. Para personalizar:

```powershell
# Crear archivo .env en src/server-flask/
New-Item -Path "src/server-flask/.env" -ItemType File

# Editar con tus configuraciones (opcional)
```

Contenido del `.env`:
```env
DB_USER=root
DB_PASSWORD=rootpassword
DB_HOST=db
DB_NAME=obligatorio
DB_POOL_SIZE=15
FLASK_DEBUG=True
FLASK_PORT=5000
SECRET_KEY=tu-clave-secreta-aqui
```

### 3️⃣ Iniciar la Aplicación

```powershell
# Construir e iniciar todos los contenedores
docker-compose up -d --build
```

Esto iniciará automáticamente:
- MySQL con la base de datos inicializada
- Backend Flask en http://localhost:5000
- Frontend React en http://localhost

### 4️⃣ Verificar Estado

```powershell
# Ver contenedores en ejecución
docker ps

# Ver logs
docker-compose logs -f

# Ver logs específicos
docker logs obligatorio-backend
docker logs obligatorio-frontend
docker logs obligatorio-mysql
```

---

## Uso del Sistema

### Acceso a la Aplicación

1. Abrir navegador en **http://localhost**
2. Registrarse o iniciar sesión
3. Explorar salas disponibles
4. Realizar reservas

### Usuarios de Prueba

El sistema incluye datos de prueba en `BaseDatos/02-InsertsTablas.sql`:

```
Email: avril.fernandez@correo.ucu.uy
Contraseña: contraseña123
Rol: Usuario regular con historial de reservas

Email: admin@correo.ucu.uy
Contraseña: admin123
Rol: Administrador (acceso a panel admin)
```

### Comandos Útiles

```powershell
# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes (resetea BD)
docker-compose down -v

# Reiniciar un servicio específico
docker-compose restart backend
docker-compose restart frontend

# Ver logs en tiempo real
docker-compose logs -f backend

# Reconstruir después de cambios en código
docker-compose up -d --build
```

---

## Estructura del Proyecto

```
Obligatorio-SQL/
├── BaseDatos/                    # Scripts SQL
│   ├── 01-TablasObligatorio.sql    # Definición de tablas
│   └── 02-InsertsTablas.sql        # Datos de prueba
│
├── src/
│   ├── client-react/             # Frontend React
│   │   ├── src/
│   │   │   ├── pages/           # Componentes de páginas
│   │   │   │   ├── Login.jsx       # Autenticación
│   │   │   │   ├── Register.jsx    # Registro de usuarios
│   │   │   │   ├── Dashboard.jsx   # Panel principal con reportes
│   │   │   │   ├── Reservar.jsx    # Formulario de reservas
│   │   │   │   ├── Profile.jsx     # Perfil de usuario
│   │   │   │   └── Admin.jsx       # Panel de administración
│   │   │   ├── App.jsx             # Componente principal
│   │   │   ├── main.jsx            # Punto de entrada
│   │   │   └── styles.css          # Estilos globales
│   │   ├── Dockerfile              # Construcción frontend
│   │   ├── package.json            # Dependencias Node
│   │   └── vite.config.js          # Configuración Vite
│   │
│   └── server-flask/             # Backend Flask
│       ├── main.py                 # Aplicación principal + rutas API
│       ├── database.py             # Pool de conexiones MySQL
│       ├── config.py               # Configuración del sistema
│       ├── entrypoint.sh           # Script de inicio Docker
│       ├── Dockerfile              # Construcción backend
│       └── requirements.txt        # Dependencias Python
│
├── docker-compose.yml              # Orquestación de servicios
└── README.md                       # Este archivo
```

---

## Base de Datos

### Esquema de Datos

El sistema utiliza **11 tablas** principales:

#### Tablas Core
- `login` - Credenciales de autenticación
- `participante` - Información de usuarios
- `sala` - Definición de salas
- `turno` - Horarios disponibles
- `reserva` - Reservas realizadas

#### Tablas Relacionales
- `reserva_participante` - Participantes por reserva
- `participante_programa_academico` - Programas de estudiantes
- `sancion_participante` - Sanciones activas

#### Tablas de Catálogo
- `facultad` - Facultades de la UCU
- `tipo_usuario` - Roles (estudiante, docente, admin)
- `tipo_sala` - Categorías de salas

### Inicialización Automática

Docker ejecuta automáticamente los scripts SQL al iniciar:

1. `01-TablasObligatorio.sql` - Crea estructura
2. `02-InsertsTablas.sql` - Inserta datos de prueba
   - 21 participantes
   - 6 salas en 4 edificios
   - 8 turnos horarios
   - 46 reservas distribuidas temporalmente
   - 8 sanciones activas

### Resetear Base de Datos

```powershell
# Detener y eliminar volúmenes
docker-compose down -v

# Reiniciar (se recreará automáticamente)
docker-compose up -d
```

---

## API Endpoints

### Autenticación
```
POST   /api/login                    # Iniciar sesión
POST   /api/login/register           # Crear credenciales
```

### Participantes
```
GET    /api/participantes            # Listar participantes
POST   /api/participantes            # Crear participante
PUT    /api/participantes/:ci        # Actualizar participante
DELETE /api/participantes/:ci        # Eliminar participante (cascada)
```

### Salas & Turnos
```
GET    /api/salas                    # Listar salas
GET    /api/turnos                   # Listar turnos
POST   /api/salas                    # Crear sala (admin)
```

### Reservas
```
GET    /api/reservas                 # Listar reservas (filtros: fecha, ci)
POST   /api/reservas                 # Crear reserva
PUT    /api/reservas/:id             # Actualizar estado
DELETE /api/reservas/:id             # Cancelar reserva
```

### Reportes (Dashboard)
```
GET    /api/reportes/salas-mas-reservadas              # Top 5 salas
GET    /api/reportes/turnos-mas-demandados             # Turnos populares
GET    /api/reportes/promedio-participantes            # Promedio por sala
GET    /api/reportes/reservas-por-carrera              # Por programa académico
GET    /api/reportes/ocupacion-por-edificio            # % ocupación
GET    /api/reportes/reservas-por-tipo-usuario         # Por rol
GET    /api/reportes/porcentaje-uso-reservas           # Uso efectivo
GET    /api/reportes/sanciones-detallado               # Sanciones por tipo
GET    /api/reportes/reservas-asistencias-detallado    # Asistencia por tipo
```

---

## Características Principales

### UI/UX Mejorado
- Paleta de colores personalizada UCU: `#c9031a`, `#9d1722`, `#4a2723`, `#07a2a6`, `#ffeccb`
- Diseño responsive (desktop, tablet, mobile)
- Animaciones suaves y transiciones
- Dashboard organizado en 5 secciones semánticas
- Cards con gradientes y efectos hover
- Tablas con contraste optimizado

### Performance
- **Pool de conexiones MySQL:** 15 conexiones simultáneas
- **Retry automático:** 3 intentos con delay de 500ms
- **Lazy loading:** Componentes React optimizados
- **Build optimizado:** Vite con tree-shaking

### Seguridad
- Validación de inputs en frontend y backend
- Sanitización de queries SQL (prepared statements)
- CORS configurado correctamente
- Eliminación en cascada de datos sensibles

### Reportes y Estadísticas
- 12+ reportes en tiempo real
- Visualización de ocupación por edificio
- Análisis de demanda por turnos
- Estadísticas de asistencia y sanciones
- Promedio de participantes por sala

---

## Desarrollo

### Desarrollo Local (Sin Docker)

Si prefieres desarrollo local sin Docker:

```powershell
# Backend
cd src/server-flask
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py

# Frontend (otra terminal)
cd src/client-react
npm install
npm run dev
```

> **Nota:** Necesitarás MySQL instalado localmente y actualizar `config.py`

### Hot Reload

Los contenedores tienen volúmenes montados para hot reload:

```yaml
volumes:
  - ./src/server-flask:/app    # Backend Flask
  - ./src/client-react:/app    # Frontend React
```

Los cambios se reflejan automáticamente sin reconstruir.

### Reconstruir Después de Cambios en package.json o requirements.txt

```powershell
docker-compose up -d --build
```

---

## Solución de Problemas

### Error: "Port 80 already in use"

```powershell
# Detener contenedores
docker-compose down

# Cambiar puerto en docker-compose.yml
# frontend:
#   ports:
#     - "8080:80"  # Cambiar 80 por 8080

docker-compose up -d
```

### Error: "Cannot connect to MySQL"

```powershell
# Verificar salud del contenedor MySQL
docker ps
# Esperar a que muestre "healthy"

# Ver logs de MySQL
docker logs obligatorio-mysql

# Reiniciar MySQL
docker-compose restart db
```

### Error 500 en Endpoints

```powershell
# Ver logs del backend
docker logs obligatorio-backend -f

# Reiniciar backend
docker-compose restart backend
```

### Base de Datos No Se Inicializa

```powershell
# Resetear completamente
docker-compose down -v
docker volume rm obligatorio-sql_db_data
docker-compose up -d
```

### Cambios en Frontend No Se Reflejan

```powershell
# Limpiar caché del navegador: Ctrl+Shift+R

# Reconstruir frontend
docker-compose up -d --build frontend
```

---

## Notas Adicionales

### Paleta de Colores UCU

```css
--color1: #c9031a;  /* Rojo principal */
--color2: #9d1722;  /* Rojo oscuro */
--color3: #4a2723;  /* Marrón oscuro */
--color4: #07a2a6;  /* Turquesa */
--color5: #ffeccb;  /* Beige claro */
```

### Puertos Utilizados

| Servicio | Puerto Host | Puerto Contenedor |
|----------|-------------|-------------------|
| Frontend | 80          | 80 (Nginx)        |
| Backend  | 5000        | 5000 (Flask)      |
| MySQL    | 3307        | 3306              |

### Volúmenes Persistentes

- `db_data` - Almacena datos de MySQL (persiste entre reinicios)

---

---

## Licencia

Este proyecto es desarrollado como parte del curso de Base de Datos I en la Universidad Católica del Uruguay.

---
