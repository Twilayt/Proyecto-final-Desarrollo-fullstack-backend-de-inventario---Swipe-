function isValidDateYYYYMMDD(v) {
  if (!v) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function validateProduct(body) {
  const required = ['sku', 'nombre', 'categoria'];
  for (const k of required) if (!body[k]) return `Falta ${k}`;
  if (body.stock != null && Number(body.stock) < 0) return 'Stock no puede ser negativo';
  if (body.precio != null && Number(body.precio) < 0) return 'Precio no puede ser negativo';
  if (!isValidDateYYYYMMDD(body.fecha_caducidad)) return 'fecha_caducidad debe ser YYYY-MM-DD';
  return null;
}

function validateClient(body) {
  if (!body.nombre) return 'Falta nombre';
  if (body.email && !/^\S+@\S+\.\S+$/.test(body.email)) return 'Email inválido';
  return null;
}

module.exports = { validateProduct, validateClient };
