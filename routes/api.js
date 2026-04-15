// ============================================================
// routes/api.js — Endpoints de clima y pagos
// ============================================================

const express  = require('express');
const fetch    = require('node-fetch');
const router   = express.Router();

// ── GET /api/weather?lat=...&lon=... ───────────────────────
// Proxy hacia OpenWeather para no exponer la API key en el front
router.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.includes('tu_api_key')) {
    // Datos de demostración cuando no hay clave configurada
    return res.json({
      demo: true,
      name: 'Ciudad Juárez',
      main: { temp: 28, humidity: 35 },
      weather: [{ description: 'cielo despejado', icon: '01d' }],
      wind: { speed: 4.2 }
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather` +
                `?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;
    const resp = await fetch(url);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener el clima' });
  }
});

// ── POST /api/pay ─────────────────────────────────────────
// Simulación de pago con Stripe (modo test)
router.post('/pay', async (req, res) => {
  const { productId, productName, amount, token } = req.body;

  // Si no hay clave de Stripe, simular pago exitoso
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey.includes('sk_test_xxx')) {
    return res.json({
      ok: true,
      demo: true,
      msg: `Pago simulado exitoso para: ${productName}`,
      chargeId: 'demo_charge_' + Date.now()
    });
  }

  // Pago real con Stripe
  try {
    const stripe = require('stripe')(stripeKey);
    const charge = await stripe.charges.create({
      amount:      Math.round(amount * 100), // Stripe trabaja en centavos
      currency:    'mxn',
      source:      token,
      description: `SkyLine Airlines — ${productName}`
    });
    res.json({ ok: true, chargeId: charge.id, msg: 'Pago completado' });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
