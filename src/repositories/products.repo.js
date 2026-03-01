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
    where.push(`(sku ILIKE $${idx} OR nombre ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countQ = `SELECT COUNT(*)::int AS total FROM public.products ${whereSQL}`;
  const dataQ = `
    SELECT id, sku, nombre, categoria, descripcion, presentacion, precio, stock, fecha_caducidad, created_at
    FROM public.products
    ${whereSQL}
    ORDER BY created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1};
  `;

  const countRes = await pool.query(countQ, values);
  const total = countRes.rows[0].total;

  const dataRes = await pool.query(dataQ, [...values, l, offset]);

  return {
    meta: { page: p, limit: l, total, totalPages: Math.ceil(total / l) },
    data: dataRes.rows
  };
}

async function create(product) {
  const q = `
    INSERT INTO public.products (sku, nombre, categoria, descripcion, presentacion, precio, stock, fecha_caducidad)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;
  const values = [
    product.sku,
    product.nombre,
    product.categoria,
    product.descripcion || null,
    product.presentacion || null,
    product.precio ?? 0,
    product.stock ?? 0,
    product.fecha_caducidad || null
  ];
  const res = await pool.query(q, values);
  return res.rows[0];
}

async function getById(id) {
  const res = await pool.query('SELECT * FROM public.products WHERE id=$1', [id]);
  return res.rows[0] || null;
}

async function update(id, product) {
  const q = `
    UPDATE public.products
    SET sku=$1, nombre=$2, categoria=$3, descripcion=$4, presentacion=$5, precio=$6, stock=$7, fecha_caducidad=$8
    WHERE id=$9
    RETURNING *;
  `;
  const values = [
    product.sku,
    product.nombre,
    product.categoria,
    product.descripcion || null,
    product.presentacion || null,
    product.precio ?? 0,
    product.stock ?? 0,
    product.fecha_caducidad || null,
    id
  ];
  const res = await pool.query(q, values);
  return res.rows[0] || null;
}

async function remove(id) {
  const res = await pool.query('DELETE FROM public.products WHERE id=$1 RETURNING id', [id]);
  return res.rows[0] || null;
}

async function expiryAlerts(dias = 30, limit = 50) {
  const d = Math.max(toInt(dias, 30), 1);
  const l = Math.min(Math.max(toInt(limit, 50), 1), 200);

  const q = `
    SELECT id, sku, nombre, stock, fecha_caducidad,
      (fecha_caducidad - current_date) AS dias_restantes
    FROM public.products
    WHERE fecha_caducidad IS NOT NULL
      AND fecha_caducidad <= (current_date + ($1::int))
    ORDER BY fecha_caducidad ASC
    LIMIT $2;
  `;
  const res = await pool.query(q, [d, l]);
  return res.rows;
}

async function lowStockAlerts(umbral = 10, limit = 50) {
  const u = Math.max(toInt(umbral, 10), 1);
  const l = Math.min(Math.max(toInt(limit, 50), 1), 200);

  const q = `
    SELECT id, sku, nombre, stock, fecha_caducidad
    FROM public.products
    WHERE stock <= $1
    ORDER BY stock ASC
    LIMIT $2;
  `;
  const res = await pool.query(q, [u, l]);
  return res.rows;
}

async function statsCount() {
  const res = await pool.query('SELECT COUNT(*)::int AS total FROM public.products');
  return res.rows[0].total;
}

async function quickList(limit = 6) {
  const l = Math.min(Math.max(toInt(limit, 6), 1), 20);
  const q = `
    SELECT sku, nombre, stock, fecha_caducidad, created_at
    FROM public.products
    ORDER BY created_at DESC
    LIMIT $1;
  `;
  const res = await pool.query(q, [l]);
  return res.rows;
}

module.exports = {
  getPaged, create, getById, update, remove,
  expiryAlerts, lowStockAlerts,
  statsCount, quickList
};
