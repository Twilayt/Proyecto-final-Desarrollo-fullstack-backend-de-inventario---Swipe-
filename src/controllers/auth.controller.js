const bcrypt = require('bcryptjs');
const { signToken } = require('../auth');
const users = require('../repositories/users.repo');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });

    const user = await users.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    return res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, role: user.role } });
  } catch (e) { next(e); }
}

module.exports = { login };
