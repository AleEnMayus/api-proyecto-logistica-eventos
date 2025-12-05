---

# 📦 Backend del Proyecto

Este backend está desarrollado con **Node.js**, **Express** y **Socket.IO**, y provee las funcionalidades principales para la gestión de eventos, usuarios, recursos y notificaciones en tiempo real.

---

## 🚀 Características Principales

* **Autenticación y cuentas**: Registro, inicio de sesión, recuperación y cambio de contraseñas.
* **Gestión de eventos**: Creación, edición, programación y finalización automática de eventos.
* **Recursos y logística**: Administración de recursos asociados a eventos.
* **Encuestas y preguntas**: Sistema de encuestas estáticas y gestión de preguntas.
* **Galería interactiva**: Subida de imágenes, comentarios y administración de galerías.
* **Contratos PDF**: Envío y descarga de contratos en formato PDF.
* **Calendario**: Organización de citas y eventos.
* **Notificaciones en tiempo real**: Implementadas con **Socket.IO**.
* **Promociones y solicitudes**: Administración de promociones y gestión de solicitudes de usuarios.

---

## 📂 Estructura del Proyecto

```
backend/
│   .env                  # Variables de entorno
│   db.js                 # Conexión a la base de datos
│   index.js              # Punto de entrada del servidor
│   package.json          # Dependencias y scripts
│   test.js               # Pruebas iniciales
│
├── config/               # Configuración (auth, DB, multer)
├── controllers/          # Lógica de negocio (Auth, Account, Events, Gallery, etc.)
├── jobs/                 # Tareas automáticas (ej. finalización de eventos)
├── middleware/           # Middlewares (auth, validaciones)
├── models/               # Modelos de datos (Account, Events, Survey, etc.)
├── routes/               # Definición de rutas (Admin y User)
├── services/             # Servicios externos (email, plantillas)
├── sockets/              # Configuración de Socket.IO
├── uploads/              # Archivos subidos (contratos, galerías, perfiles)
└── utils/                # Utilidades generales
```

---

## ⚙️ Instalación y Uso

1. Clonar el repositorio:

   ```bash
   git clone <url-del-repo>
   cd backend
   ```

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Configurar variables de entorno en `.env`:

   ```env
   PORT=4000
   FRONTEND_ORIGIN=http://localhost:5173
   DB_URI=<cadena-de-conexion>
   ```

4. Ejecutar el servidor:

   ```bash
   npm start
   ```

El backend estará disponible en:
`http://localhost:4000`

---

## 🔌 Endpoints Principales

* `GET /` → Verificación de estado del servidor
* `POST /api/auth` → Autenticación de usuarios
* `POST /api/password` → Cambio de contraseña
* `GET /api/events` → Gestión de eventos
* `GET /api/resources` → Recursos asociados a eventos
* `GET /api/gallery` → Galería de imágenes y comentarios
* `GET /api/contracts` → Subida y descarga de contratos
* `GET /api/calendar` → Calendario de citas y eventos
* `GET /api/promotions` → Promociones
* `GET /api/survey` → Encuestas
* `GET /api/requests` → Solicitudes de usuarios

---

## 🛠️ Tecnologías Utilizadas

* **Node.js** + **Express** → Servidor web
* **MongoDB** → Base de datos
* **Socket.IO** → Notificaciones en tiempo real
* **Multer** → Gestión de archivos
* **Cors** y **Cookie-Parser** → Seguridad y manejo de sesiones

---