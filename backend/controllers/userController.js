const cartModel = require('../models/cartModel');
const favoriteModel = require('../models/favoriteModel');
const gameModel = require('../models/gameModel');

async function getCart(req, res) {
  try {
    const games = await cartModel.findByUserId(req.user.id);
    return res.json(games);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function addCartItem(req, res) {
  try {
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ error: 'gameId es obligatorio' });
    }

    const game = await gameModel.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    await cartModel.addItem(req.user.id, gameId);
    return res.status(201).json({ message: 'Juego añadido al carrito' });
  } catch (error) {
    console.error('Error al añadir juego al carrito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function removeCartItem(req, res) {
  try {
    const gameId = req.params.gameId;
    await cartModel.removeItem(req.user.id, gameId);
    return res.json({ message: 'Juego eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar juego del carrito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getFavorites(req, res) {
  try {
    const games = await favoriteModel.findByUserId(req.user.id);
    return res.json(games);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function addFavorite(req, res) {
  try {
    const { gameId } = req.body;
    if (!gameId) {
      return res.status(400).json({ error: 'gameId es obligatorio' });
    }

    const game = await gameModel.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    await favoriteModel.addItem(req.user.id, gameId);
    return res.status(201).json({ message: 'Juego añadido a favoritos' });
  } catch (error) {
    console.error('Error al añadir favorito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function removeFavorite(req, res) {
  try {
    const gameId = req.params.gameId;
    await favoriteModel.removeItem(req.user.id, gameId);
    return res.json({ message: 'Juego eliminado de favoritos' });
  } catch (error) {
    console.error('Error al eliminar favorito:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getCart,
  addCartItem,
  removeCartItem,
  getFavorites,
  addFavorite,
  removeFavorite
};
