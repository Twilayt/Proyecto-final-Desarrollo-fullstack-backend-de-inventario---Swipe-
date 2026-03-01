const products = require('./products.repo');
const clients = require('./clients.repo');

function daysBetween(dateStr) {
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  const ms = d - new Date(today.toISOString().slice(0, 10) + 'T00:00:00');
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

async function resumen({ expiryDays, lowStock }) {
  const productosTotal = await products.statsCount();
  const clientesActivosConHistorial = await clients.activeWithHistoryCount();

  const cad = await products.expiryAlerts(expiryDays, 50);
  const alertasCaducidad = cad.length;

  const quick = await products.quickList(6);
  const low = await products.lowStockAlerts(lowStock, 50);

  const alerts = [];
  for (const x of cad.slice(0, 5)) {
    alerts.push({ tipo: 'caducidad', sku: x.sku, nombre: x.nombre, dias: x.dias_restantes ?? (x.fecha_caducidad ? daysBetween(x.fecha_caducidad) : null) });
  }
  for (const x of low.slice(0, 5)) {
    alerts.push({ tipo: 'stock', sku: x.sku, nombre: x.nombre, stock: x.stock });
  }

  const quickProducts = quick.map(p => {
    const status =
      (p.fecha_caducidad && daysBetween(p.fecha_caducidad) <= expiryDays) ? 'Caduca pronto' :
      (p.stock <= lowStock) ? 'Bajo stock' :
      'OK';
    return { sku: p.sku, nombre: p.nombre, stock: p.stock, fecha_caducidad: p.fecha_caducidad, estado: status };
  });

  return { stats: { productosTotal, clientesActivosConHistorial, alertasCaducidad }, quickProducts, alerts };
}

module.exports = { resumen };
