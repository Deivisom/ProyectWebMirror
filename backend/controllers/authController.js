const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

async function login(req, res) {
  const { username, password } = req.body;

  try {
    // 1. Buscar usuario en la base de datos
    const user = await userModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Nombre de cuenta o contraseña incorrectos' });
    }

    // 2. Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nombre de cuenta o contraseña incorrectos' });
    }

    // 3. Generar Token JWT
    // Incluimos el ID, username y role en el payload
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Responder con los datos del usuario (sin la contraseña) y el token
    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  login
};
