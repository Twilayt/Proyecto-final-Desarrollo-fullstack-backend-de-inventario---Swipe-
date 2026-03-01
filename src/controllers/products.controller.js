const repo = require('../repositories/products.repo');

async function list(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await repo.getPaged({ page, limit, search });
    return res.json(result);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const created = await repo.create(req.body);
    return res.status(201).json(created);
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const row = await repo.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(row);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const updated = await repo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(updated);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const deleted = await repo.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json({ ok: true, id: deleted.id });
  } catch (e) { next(e); }
}

async function alertasCaducidad(req, res, next) {
  try {
    const dias = req.query.dias ?? process.env.EXPIRY_DAYS ?? 30;
    const rows = await repo.expiryAlerts(dias);
    return res.json({ dias: Number(dias), total: rows.length, data: rows });
  } catch (e) { next(e); }
}

async function alertasStock(req, res, next) {
  try {
    const umbral = req.query.umbral ?? process.env.LOW_STOCK_THRESHOLD ?? 10;
    const rows = await repo.lowStockAlerts(umbral);
    return res.json({ umbral: Number(umbral), total: rows.length, data: rows });
  } catch (e) { next(e); }
}

module.exports = { list, create, getById, update, remove, alertasCaducidad, alertasStock };
