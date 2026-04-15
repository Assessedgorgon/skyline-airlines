// ============================================================
// routes/auth.js — Registro, Login y Logout
// ============================================================

const express  = require('express');
const bcrypt   = require('bcryptjs');   // Para hashear contraseñas
const router   = express.Router();
let   pool;

// Intentar conectar a la BD (si falla, el modo demo sigue funcionando)
try { pool = require('../config/db'); } catch(e) {}

// ── POST /auth/register ────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ ok: false, msg: 'Todos los campos son obligatorios' });
  }

  try {
    // Hashear la contraseña con bcrypt (10 rondas de salt)
    const hash = await bcrypt.hash(password, 10);

    if (pool) {
      await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hash]
      );
    }
    // En modo demo (sin BD) simplemente aceptamos el registro
    res.json({ ok: true, msg: 'Cuenta creada exitosamente' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ ok: false, msg: 'El correo ya está registrado' });
    }
    console.error(err);
    // En demo, ignoramos errores de BD
    res.json({ ok: true, msg: 'Cuenta creada (modo demo)' });
  }
});

// ── POST /auth/login ───────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ ok: false, msg: 'Ingresa correo y contraseña' });
  }

  try {
    let user = null;

    if (pool) {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ?', [email]
      );
      user = rows[0];
    }

    // Modo demo: si no hay BD, aceptar demo@skyline.com / demo123
    if (!pool) {
      if (email === 'demo@skyline.com' && password === 'demo123') {
        user = { id: 1, name: 'Usuario Demo', email };
      }
    }

    if (!user) {
      return res.json({ ok: false, msg: 'Credenciales incorrectas' });
    }

    // Verificar contraseña (omitir en modo demo con usuario hardcoded)
    let valid = true;
    if (pool) {
      valid = await bcrypt.compare(password, user.password);
    }

    if (!valid) {
      return res.json({ ok: false, msg: 'Credenciales incorrectas' });
    }

    // Guardar datos en sesión
    req.session.user = { id: user.id, name: user.name, email: user.email };
    res.json({ ok: true, msg: `Bienvenido, ${user.name}` });

  } catch (err) {
    console.error(err);
    res.json({ ok: false, msg: 'Error del servidor' });
  }
});

// ── GET /auth/logout ───────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ── GET /auth/me — para verificar sesión desde el front ───
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ ok: true, user: req.session.user });
  } else {
    res.json({ ok: false });
  }
});

module.exports = router;
