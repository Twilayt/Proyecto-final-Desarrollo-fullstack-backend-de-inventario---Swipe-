const repo = require('../repositories/clients.repo');

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
    if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json(row);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const updated = await repo.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json(updated);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const deleted = await repo.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.json({ ok: true, id: deleted.id });
  } catch (e) { next(e); }
}

module.exports = { list, create, getById, update, remove };
