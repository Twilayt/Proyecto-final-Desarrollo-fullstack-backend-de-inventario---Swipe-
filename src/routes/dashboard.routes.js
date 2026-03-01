const express = require('express');
const c = require('../controllers/dashboard.controller');
const { authMiddleware } = require('../auth');

const router = express.Router();
router.get('/resumen', authMiddleware, c.resumen);

module.exports = { router };
