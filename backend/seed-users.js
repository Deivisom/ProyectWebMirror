const bcrypt = require('bcryptjs');
const pool = require('./models/db');

async function seedUsers() {
  try {
    const password = '1234';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('Generando usuarios con contraseña "1234"...');

    // Limpiar usuarios antiguos para evitar conflictos de hash incorrectos
    await pool.query('DELETE FROM users');

    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hash, 'admin']
    );

    await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['akn.raouia', hash, 'user']
    );

    console.log('Usuarios creados exitosamente:');
    console.log('- admin / 1234 (admin)');
    console.log('- akn.raouia / 1234 (user)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear usuarios:', error);
    process.exit(1);
  }
}

seedUsers();
