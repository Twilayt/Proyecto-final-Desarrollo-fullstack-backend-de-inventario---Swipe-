require('dotenv').config();

// ---------- DNS: prefer IPv4 ----------
const dns = require("dns");
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder("ipv4first");

console.log("[BOOT] node:", process.version);
console.log("[BOOT] dns order:", dns.getDefaultResultOrder ? dns.getDefaultResultOrder() : "not-supported");

// Debug (sin exponer password)
const dbUrl = process.env.DATABASE_URL || "";
const dbHostMatch = dbUrl.match(/@([^:/?]+)/);
console.log("[DB] host:", dbHostMatch ? dbHostMatch[1] : "unknown");
console.log("[DB] has pooler:", dbUrl.includes("pooler.supabase.com"));

// ---------- App ----------
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { pool } = require('./src/db');
const { routes } = require('./src/routes');
const { errorHandler, notFound } = require('./src/middlewares/error.middleware');

const PORT = Number(process.env.PORT) || 3000;   // ✅ Render inyecta PORT
const app = express();

// Render / proxies
app.set('trust proxy', 1); // ✅ recomendado detrás de proxy

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes, por favor intente de nuevo más tarde.'
});
app.use(limiter);

// CORS allowlist
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    // Requests sin Origin (Postman, curl) -> OK
    if (!origin) return cb(null, true);

    // Si no configuraste allowlist, permite todo (útil mientras debuggeas)
    if (allowed.length === 0) return cb(null, true);

    // Permite si está en la lista
    if (allowed.includes(origin)) return cb(null, true);

    //  NO lanzar Error (puede causar 502 si no se maneja)
    return cb(null, false);
  }
}));

// Si CORS bloqueó (origin no permitido), responde 403 claro
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowed.length > 0 && !allowed.includes(origin)) {
    return res.status(403).json({ error: `CORS bloqueado: ${origin}` });
  }
  next();
});

app.use(express.json());

// Logging básico
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Rutas base
app.get('/', (req, res) => res.send('API OK'));

// Health simple (no DB)
app.get('/health', (req, res) => res.json({ ok: true }));

// Health DB
app.get('/health/db', async (req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    return res.json({ ok: true, db: r.rows[0].ok });
  } catch (err) {
    console.log('[DB] Error:', err.message);
    return res.status(500).json({ ok: false, error: 'DB no disponible' });
  }
});

// API
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

// en Render: escuchar en 0.0.0.0
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Timeouts para evitar cuelgues raros
server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;

module.exports = { app };