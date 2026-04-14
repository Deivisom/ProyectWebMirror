const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir los archivos estáticos de la interfaz (HTML, CSS, JS e imágenes)
app.use(express.static(__dirname));

// Configuración de conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'steam'
};

// Endpoint para obtener todos los juegos
app.get('/api/games', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM games');
    await connection.end();
    
    // Parsear la columna 'screenshots' a arreglo (array) en caso de que SQL la devuelva como texto
    const processedRows = rows.map(row => {
      if (typeof row.screenshots === 'string') {
        try {
          row.screenshots = JSON.parse(row.screenshots);
        } catch (e) {
          row.screenshots = [];
        }
      }
      if (!row.screenshots) row.screenshots = [];
      return row;
    });

    res.json(processedRows);
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener un juego por ID
app.get('/api/games/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM games WHERE id = ?', [req.params.id]);
    await connection.end();
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    const game = rows[0];
    if (typeof game.screenshots === 'string') {
      try { game.screenshots = JSON.parse(game.screenshots); } catch(e) { game.screenshots = []; }
    }
    if (!game.screenshots) game.screenshots = [];
    res.json(game);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(port, () => {
  console.log(`Servidor de Steam Clone ejecutándose en http://localhost:${port}`);
});
