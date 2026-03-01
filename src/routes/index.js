const express = require('express');

const { router: authRouter } = require('./auth.routes');
const { router: productsRouter } = require('./products.routes');
const { router: clientsRouter } = require('./clients.routes');
const { router: dashboardRouter } = require('./dashboard.routes');
const { router: weatherRouter } = require('./weather.routes');

const routes = express.Router();

routes.use('/auth', authRouter);
routes.use('/products', productsRouter);
routes.use('/clients', clientsRouter);
routes.use('/dashboard', dashboardRouter);
routes.use('/weather', weatherRouter);

module.exports = { routes };
