const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const gameRoutes = require('./routes/gameRoutes');
const authController = require('./controllers/authController');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const publicPath = path.join(__dirname, '..', 'public');

app.use('/api/games', gameRoutes);
app.post('/api/auth/login', authController.login);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const pageRoutes = {
  login: 'login.html',
  admin: 'admin.html',
  carrito: 'carrito_compra.html',
  favoritos: 'lista_favoritos.html',
  login_page: 'login_page.html',
  login_page2: 'login_page2.html',
  login_page_content: 'login_page_content.html',
  steam_login_temp: 'steam_login_temp.html',
  steamcommunity_login: 'steamcommunity_login.html'
};

app.get('/:page', (req, res, next) => {
  const pageFile = pageRoutes[req.params.page];
  if (!pageFile) {
    return next();
  }
  res.sendFile(path.join(publicPath, pageFile));
});

app.use((err, req, res, next) => {
  console.error('Middleware de error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Servidor de Steam Clone ejecutándose en http://localhost:${port}`);
});
