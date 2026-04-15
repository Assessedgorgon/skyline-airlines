// ============================================================
// routes/pages.js — Sirve las páginas HTML
// ============================================================

const express = require('express');
const path    = require('path');
const router  = express.Router();

// Middleware: redirigir a login si no hay sesión
function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  res.redirect('/?login=required');
}

// Página principal (login + registro)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

// Estas páginas requieren sesión activa
router.get('/home',     requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, '../views/home.html')));

router.get('/search',   requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, '../views/search.html')));

router.get('/products', requireLogin, (req, res) =>
  res.sendFile(path.join(__dirname, '../views/products.html')));

router.get('/about',    (req, res) =>
  res.sendFile(path.join(__dirname, '../views/about.html')));

module.exports = router;
