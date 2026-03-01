/** validateBody(fn): fn(body) => null | 'error msg' */
function validateBody(fn) {
  return (req, res, next) => {
    const err = fn(req.body);
    if (err) return res.status(400).json({ error: err });
    return next();
  };
}

module.exports = { validateBody };
