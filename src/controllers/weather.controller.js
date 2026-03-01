async function weather(req, res, next) {
  try {
    const city = (req.query.city || 'Chihuahua').toString();

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es&format=json`;
    const geoResp = await fetch(geoUrl);
    if (!geoResp.ok) return res.status(502).json({ error: 'Error consultando geocoding' });

    const geo = await geoResp.json();
    const place = geo.results?.[0];
    if (!place) return res.status(404).json({ error: 'Ciudad no encontrada' });

    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m&timezone=auto`;
    const wResp = await fetch(wUrl);
    if (!wResp.ok) return res.status(502).json({ error: 'Error consultando clima' });

    const w = await wResp.json();
    return res.json({
      city: place.name,
      region: place.admin1,
      country: place.country,
      tempC: w.current?.temperature_2m ?? null
    });
  } catch (e) { next(e); }
}

module.exports = { weather };
