const express = require('express');
const c = require('../controllers/weather.controller');

const router = express.Router();
router.get('/', c.weather);

module.exports = { router };
