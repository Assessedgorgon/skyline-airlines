// ============================================================
// server.js — Punto de entrada principal de SkyLine Airlines
// ============================================================

const express = require('express');        // Framework web
const session = require('express-session'); // Manejo de sesiones
const path    = require('path');            // Utilidades de rutas
require('dotenv').config();                // Variables de entorno
const pool = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;

// ── Configuración del motor de plantillas ──────────────────
// Express puede servir HTML directamente desde la carpeta 'views'
app.set('views', path.join(__dirname, 'views'));

// ── Middlewares globales ───────────────────────────────────
// Parsear JSON y datos de formularios HTML
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos (CSS, JS, imágenes del cliente)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesiones (almacena login del usuario)
app.use(session({
  secret: process.env.SESSION_SECRET || 'skyline_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 horas
}));

// ── Middleware: inyectar API keys en archivos HTML ─────────
// Esto reemplaza el placeholder %%GOOGLE_MAPS_API_KEY%% con
// el valor real del .env antes de enviar la página al cliente
const fs = require('fs');

app.use((req, res, next) => {
  const originalSendFile = res.sendFile.bind(res);
  res.sendFile = function(filePath, options, callback) {
    if (filePath.endsWith('.html')) {
      fs.readFile(filePath, 'utf8', (err, html) => {
        if (err) return next(err);
        const processed = html.replace(/%%GOOGLE_MAPS_API_KEY%%/g,
          process.env.GOOGLE_MAPS_API_KEY || '');
        res.setHeader('Content-Type', 'text/html');
        res.send(processed);
      });
    } else {
      originalSendFile(filePath, options, callback);
    }
  };
  next();
});

// ── Importar rutas ─────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const pageRoutes     = require('./routes/pages');
const apiRoutes      = require('./routes/api');

// Montar rutas
app.use('/auth', authRoutes);   // /auth/register, /auth/login, /auth/logout
app.use('/api', apiRoutes);     // /api/weather, /api/pay
app.use('/', pageRoutes);       // /, /search, /products, /about

// ── Arrancar el servidor ───────────────────────────────────
app.listen(PORT, async () => {
  console.log(`✈ SkyLine Airlines corriendo en puerto ${PORT}`);

  try {
    const [rows] = await pool.query('SELECT 1 AS test');
    console.log('✅ MySQL conectado correctamente:', rows);
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
  }
});
