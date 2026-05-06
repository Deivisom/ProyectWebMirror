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

async function findAll({ page, limit }) {
  if (page !== undefined || limit !== undefined) {
    const pageNumber = Number.isNaN(parseInt(page, 10)) ? 1 : parseInt(page, 10);
    const limitNumber = Number.isNaN(parseInt(limit, 10)) ? 10 : parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;
    const [rows] = await pool.query(`SELECT * FROM games LIMIT ${limitNumber} OFFSET ${offset}`);
    return rows.map(parseScreenshots);
  }

  const [rows] = await pool.query('SELECT * FROM games');
  return rows.map(parseScreenshots);
}

async function countAll() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM games');
  return rows[0]?.total || 0;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM games WHERE id = ?', [id]);
  if (!rows.length) return null;
  return parseScreenshots(rows[0]);
}

async function create(game) {
  const screenshotsJson = JSON.stringify(game.screenshots || []);
  const [result] = await pool.query(
    'INSERT INTO games (title, category, tag, main_image, price, original_price, final_price, discount, screenshots) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [game.title, game.category, game.tag, game.main_image, game.price, game.original_price, game.final_price, game.discount, screenshotsJson]
  );
  return result.insertId;
}

async function update(id, game) {
  const screenshotsJson = JSON.stringify(game.screenshots || []);
  const [result] = await pool.query(
    'UPDATE games SET title = ?, category = ?, tag = ?, main_image = ?, price = ?, original_price = ?, final_price = ?, discount = ?, screenshots = ? WHERE id = ?',
    [game.title, game.category, game.tag, game.main_image, game.price, game.original_price, game.final_price, game.discount, screenshotsJson, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM games WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  countAll,
  findById,
  create,
  update,
  remove
};
