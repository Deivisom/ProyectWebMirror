const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await userModel.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Nombre de cuenta o contraseña incorrectos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nombre de cuenta o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

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

async function register(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Nombre de usuario y contraseña son obligatorios' });
  }

  if (!/^[a-zA-Z0-9_.-]{4,20}$/.test(username)) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener entre 4 y 20 caracteres válidos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const existingUser = await userModel.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertId = await userModel.create({ username, password: hashedPassword, role: 'user' });

    return res.status(201).json({ message: 'Usuario registrado correctamente', id: insertId });
  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  login,
  register
};
