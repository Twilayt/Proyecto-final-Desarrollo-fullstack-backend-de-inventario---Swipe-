const { pool } = require('../db');

async function findByEmail(email) {
  const res = await pool.query('SELECT * FROM public.users WHERE email=$1', [email]);
  return res.rows[0] || null;
}

async function getById(id) {
  const res = await pool.query('SELECT id, nombre, email, role, created_at FROM public.users WHERE id=$1', [id]);
  return res.rows[0] || null;
}

module.exports = { findByEmail, getById };
