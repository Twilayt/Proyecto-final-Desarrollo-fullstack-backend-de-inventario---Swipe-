const dashboard = require('../repositories/dashboard.repo');

async function resumen(req, res, next) {
  try {
    const expiryDays = parseInt(process.env.EXPIRY_DAYS || '30', 10);
    const lowStock = parseInt(process.env.LOW_STOCK_THRESHOLD || '10', 10);

    const data = await dashboard.resumen({ expiryDays, lowStock });
    return res.json(data);
  } catch (e) { next(e); }
}

module.exports = { resumen };
