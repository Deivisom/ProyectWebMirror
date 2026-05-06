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
    `SELECT g.* FROM favorite_items f
     JOIN games g ON f.game_id = g.id
     WHERE f.user_id = ?`,
    [userId]
  );
  return rows.map(parseScreenshots);
}

async function addItem(userId, gameId) {
  const [result] = await pool.query(
    'INSERT IGNORE INTO favorite_items (user_id, game_id) VALUES (?, ?)',
    [userId, gameId]
  );
  return result.affectedRows;
}

async function removeItem(userId, gameId) {
  const [result] = await pool.query(
    'DELETE FROM favorite_items WHERE user_id = ? AND game_id = ?',
    [userId, gameId]
  );
  return result.affectedRows;
}

module.exports = {
  findByUserId,
  addItem,
  removeItem
};
