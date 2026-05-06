const jwt = require('jsonwebtoken');
require('dotenv').config();

const ADMIN_USER = process.env.ADMIN_USER || 'akn.raouia';
const ADMIN_PASS = process.env.ADMIN_PASS || '1234';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: { username } });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
}

module.exports = {
  login
};
