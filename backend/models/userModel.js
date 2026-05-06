const pool = require('./db');

async function findByUsername(username) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!rows.length) return null;
  return rows[0];
}

async function create(user) {
  const [result] = await pool.query(
    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
    [user.username, user.password, user.role || 'user']
  );
  return result.insertId;
}

module.exports = {
  findByUsername,
  create
};
