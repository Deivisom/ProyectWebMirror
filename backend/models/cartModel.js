const pool = require('./db');

function parseScreenshots(row) {
  if (typeof row.screenshots === 'string') {
    try {
      row.screenshots = JSON.parse(row.screenshots);
    } catch (e) {
      row.screenshots = [];
    }
  }

  if (!row.screenshots) {
    row.screenshots = [];
  }

  return row;
}

async function findByUserId(userId) {
  const [rows] = await pool.query(
    `SELECT g.* FROM cart_items c
     JOIN games g ON c.game_id = g.id
     WHERE c.user_id = ?`,
    [userId]
  );
  return rows.map(parseScreenshots);
}

async function addItem(userId, gameId) {
  const [result] = await pool.query(
    'INSERT IGNORE INTO cart_items (user_id, game_id) VALUES (?, ?)',
    [userId, gameId]
  );
  return result.affectedRows;
}

async function removeItem(userId, gameId) {
  const [result] = await pool.query(
    'DELETE FROM cart_items WHERE user_id = ? AND game_id = ?',
    [userId, gameId]
  );
  return result.affectedRows;
}

module.exports = {
  findByUserId,
  addItem,
  removeItem
};
