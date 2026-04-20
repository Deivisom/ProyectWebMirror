const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'steam'
  };

  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.execute('SELECT * FROM games');

  for (const game of rows) {
    const match = game.main_image.match(/\/apps\/(\d+)\//);
    if (!match) continue;
    const appId = match[1];

    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const data = await res.json();
      if (data && data[appId] && data[appId].success) {
        const steamData = data[appId].data;
        if (steamData.screenshots && steamData.screenshots.length > 0) {
          const newScreenshots = JSON.stringify(steamData.screenshots.slice(0, 4).map(s => s.path_full));
          await connection.execute('UPDATE games SET screenshots = ? WHERE id = ?', [newScreenshots, game.id]);
          console.log(`Updated screenshots for ${game.title} (AppID: ${appId})`);
        }
      } else {
        console.log(`No Steam data for ${game.title} (AppID: ${appId})`);
      }
    } catch (err) {
      console.error(`Error updating ${game.title}:`, err.message);
    }
  }

  await connection.end();
  console.log("Done updating database!");
}

fix();
