const express = require('express');
const c = require('../controllers/products.controller');
const { authMiddleware, requireRole } = require('../auth');
const { validateBody } = require('../middlewares/validate.middleware');
const { validateProduct } = require('../utils/validators');

const router = express.Router();

router.get('/', authMiddleware, c.list);
router.get('/alertas/caducidad', authMiddleware, c.alertasCaducidad);
router.get('/alertas/stock', authMiddleware, c.alertasStock);
router.get('/:id', authMiddleware, c.getById);

router.post('/', authMiddleware, requireRole('admin'), validateBody(validateProduct), c.create);
router.put('/:id', authMiddleware, requireRole('admin'), validateBody(validateProduct), c.update);
router.delete('/:id', authMiddleware, requireRole('admin'), c.remove);

module.exports = { router };
