function notFound(req, res, next) {
  return res.status(404).json({ error: 'Ruta no encontrada' });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err && typeof err.message === 'string' && err.message.startsWith('CORS bloqueado')) {
    return res.status(403).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = err.message || 'Error interno';
  return res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
