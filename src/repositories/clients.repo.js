const { pool } = require('../db');

function toInt(v, fallback) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

async function getPaged({ page = 1, limit = 5, search = '' }) {
  const p = Math.max(toInt(page, 1), 1);
  const l = Math.min(Math.max(toInt(limit, 5), 1), 50);
  const offset = (p - 1) * l;

  const where = [];
  const values = [];
  let idx = 1;

  if (search) {
    where.push(`(nombre ILIKE $${idx} OR email ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countQ = `SELECT COUNT(*)::int AS total FROM public.clients ${whereSQL}`;
  const dataQ = `
    SELECT id, nombre, telefono, email, direccion, activo, created_at
    FROM public.clients
    ${whereSQL}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1};
  `;

  const countRes = await pool.query(countQ, values);
  const total = countRes.rows[0].total;

  const dataRes = await pool.query(dataQ, [...values, l, offset]);

  return { meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }, data: dataRes.rows };
}

async function create(client) {
  const q = `
    INSERT INTO public.clients (nombre, telefono, email, direccion, activo)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
  `;
  const values = [
    client.nombre,
    client.telefono || null,
    client.email || null,
    client.direccion || null,
    client.activo ?? true
  ];
  const res = await pool.query(q, values);
  return res.rows[0];
}

async function getById(id) {
  const res = await pool.query('SELECT * FROM public.clients WHERE id=$1', [id]);
  return res.rows[0] || null;
}

async function update(id, client) {
  const q = `
    UPDATE public.clients
    SET nombre=$1, telefono=$2, email=$3, direccion=$4, activo=$5
    WHERE id=$6
    RETURNING *;
  `;
  const values = [
    client.nombre,
    client.telefono || null,
    client.email || null,
    client.direccion || null,
    client.activo ?? true,
    id
  ];
  const res = await pool.query(q, values);
  return res.rows[0] || null;
}

async function remove(id) {
  const res = await pool.query('DELETE FROM public.clients WHERE id=$1 RETURNING id', [id]);
  return res.rows[0] || null;
}

async function activeWithHistoryCount() {
  const q = `
    SELECT COUNT(DISTINCT c.id)::int AS total
    FROM public.clients c
    JOIN public.sales s ON s.client_id = c.id
    WHERE c.activo = true;
  `;
  const res = await pool.query(q);
  return res.rows[0]?.total || 0;
}

module.exports = { getPaged, create, getById, update, remove, activeWithHistoryCount };
