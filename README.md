# ✈ SkyLine Airlines — Web App

Aplicación web completa construida con **Node.js + Express**, tema de aerolínea premium.

---

## 🏗️ Estructura del proyecto

```
skyline-airlines/
├── server.js              ← Punto de entrada, configuración de Express
├── .env.example           ← Plantilla de variables de entorno
├── config/
│   └── db.js              ← Conexión a MySQL (pool de conexiones)
├── routes/
│   ├── auth.js            ← POST /auth/register, /auth/login, GET /auth/logout
│   ├── pages.js           ← Sirve los archivos HTML de cada página
│   └── api.js             ← GET /api/weather, POST /api/pay
├── views/                 ← Páginas HTML
│   ├── index.html         ← Login / Registro
│   ├── home.html          ← Inicio con clima y geolocalización
│   ├── search.html        ← Mapa interactivo + búsqueda de lugares
│   ├── products.html      ← Catálogo de vuelos + pago
│   └── about.html         ← Información de empresa + mapa + contacto
└── public/
    └── css/
        └── main.css       ← Estilos globales compartidos
```

---

## ⚡ Instalación y uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar MySQL
```sql
-- Crear usuario (opcional)
CREATE USER 'skyline'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL ON skyline_airlines.* TO 'skyline'@'localhost';
-- La base de datos y tablas se crean automáticamente al iniciar
```

### 4. Arrancar el servidor
```bash
node server.js
# Disponible en http://localhost:3000
```

---

## 🔑 APIs externas (opcionales)

La aplicación funciona en **modo demo** sin ninguna API key.
Para activar cada función real:

| API | Para qué | Dónde obtenerla |
|-----|----------|-----------------|
| OpenWeather | Clima real en /home | openweathermap.org/api |
| Google Maps + Places | Mapa en /search y /about | console.cloud.google.com |
| Stripe (test keys) | Pagos reales en /products | dashboard.stripe.com |

---

## 🚀 Explicación del servidor Express

### Middlewares configurados en `server.js`

```js
app.use(express.json())              // Parsea body JSON
app.use(express.urlencoded(...))     // Parsea formularios HTML
app.use(express.static('public'))    // Sirve archivos estáticos (CSS/JS)
app.use(session({...}))              // Maneja sesiones de usuario
```

### Rutas montadas

| Prefijo | Archivo | Función |
|---------|---------|---------|
| `/auth` | routes/auth.js | Registro, login, logout |
| `/api`  | routes/api.js  | Clima, pagos |
| `/`     | routes/pages.js | Páginas HTML |

### Protección de rutas
El middleware `requireLogin` en `routes/pages.js` redirige a `/` si no hay sesión activa.

---

## 🎯 Cuenta demo

Sin necesidad de MySQL, puedes entrar con:
- **Correo:** `demo@skyline.com`
- **Contraseña:** `demo123`
