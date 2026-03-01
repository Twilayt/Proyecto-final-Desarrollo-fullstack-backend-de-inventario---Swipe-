const express = require('express');
const c = require('../controllers/clients.controller');
const { authMiddleware, requireRole } = require('../auth');
const { validateBody } = require('../middlewares/validate.middleware');
const { validateClient } = require('../utils/validators');

const router = express.Router();

router.get('/', authMiddleware, c.list);
router.get('/:id', authMiddleware, c.getById);

router.post('/', authMiddleware, requireRole('admin'), validateBody(validateClient), c.create);
router.put('/:id', authMiddleware, requireRole('admin'), validateBody(validateClient), c.update);
router.delete('/:id', authMiddleware, requireRole('admin'), c.remove);

module.exports = { router };
