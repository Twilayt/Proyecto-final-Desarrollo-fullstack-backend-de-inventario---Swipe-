require('dotenv').config();
//
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");


//
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { pool } = require('./src/db');
const { routes } = require('./src/routes');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');

const PORT = process.env.PORT || 3000;
const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes, por favor intente de nuevo más tarde.'
});
app.use(limiter);

const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.length === 0) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS bloqueado: ' + origin));
  }
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.send('API OK'));

app.get('/health', async (req, res) => {
  try {
    await pool.query('select 1');
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
});

app.get('/health/db', async (req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    return res.json({ ok: true, db: r.rows[0].ok });
  } catch (err) {
    console.log('DB Error', err.message);
    return res.status(500).json({ ok: false, error: 'DB no disponible' });
  }
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = { app };
