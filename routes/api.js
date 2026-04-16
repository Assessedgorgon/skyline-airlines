const express = require('express');
const fetch   = require('node-fetch');
const router  = express.Router();

// ── GET /api/weather?lat=...&lon=... ──────────────────────
router.get('/weather', async (req, res) => {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.includes('tu_api_key')) {
    return res.json({
      demo: true, name: 'Ciudad Juárez',
      main: { temp: 28, humidity: 35 },
      weather: [{ description: 'cielo despejado', icon: '01d' }],
      wind: { speed: 4.2 }
    });
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es&q=Ciudad Juarez,MX`;
    const resp = await fetch(url);
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'No se pudo obtener el clima' });
  }
});

// ── POST /api/pay ─────────────────────────────────────────
router.post('/pay', async (req, res) => {
  const { productName, amount, token } = req.body;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Sin clave o clave demo → pago simulado
  if (!stripeKey || stripeKey.includes('sk_test_xxx') || stripeKey.includes('xxxxxx')) {
    return res.json({
      ok: true, demo: true,
      msg: `Pago simulado exitoso para: ${productName}`,
      chargeId: 'demo_charge_' + Date.now()
    });
  }

  // Pago real con Stripe
  try {
    let stripe;
    try { stripe = require('stripe')(stripeKey); }
    catch(e) {
      // stripe no instalado → modo demo
      return res.json({ ok: true, demo: true, msg: `Pago simulado: ${productName}`, chargeId: 'demo_' + Date.now() });
    }

    const charge = await stripe.charges.create({
      amount:      Math.round(amount * 100),
      currency:    'mxn',
      source:      token || 'tok_visa',
      description: `SkyLine Airlines — ${productName}`
    });
    res.json({ ok: true, chargeId: charge.id, msg: 'Pago completado' });
  } catch (err) {
    res.status(400).json({ ok: false, msg: err.message });
  }
});

module.exports = router;
