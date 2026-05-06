const cartModel = require('../models/cartModel');
const favoriteModel = require('../models/favoriteModel');

// --- CARRITO ---

async function getCart(req, res) {
  const userId = req.user.id;
  try {
    const items = await cartModel.findByUserId(userId);
    res.json(items);
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
}

async function addToCart(req, res) {
  const userId = req.user.id;
  const { gameId } = req.body;
  
  if (!gameId) return res.status(400).json({ error: 'ID de juego requerido' });

  try {
    await cartModel.addItem(userId, gameId);
    res.json({ message: 'Juego añadido al carrito' });
  } catch (error) {
    console.error('Error al añadir al carrito:', error);
    res.status(500).json({ error: 'Error al añadir al carrito' });
  }
}

async function removeFromCart(req, res) {
  const userId = req.user.id;
  const gameId = req.params.gameId;

  try {
    await cartModel.removeItem(userId, gameId);
    res.json({ message: 'Juego eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
}

// --- FAVORITOS ---

async function getWishlist(req, res) {
  const userId = req.user.id;
  try {
    const items = await favoriteModel.findByUserId(userId);
    res.json(items);
  } catch (error) {
    console.error('Error al obtener favoritos:', error);
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
}

async function addToWishlist(req, res) {
  const userId = req.user.id;
  const { gameId } = req.body;

  if (!gameId) return res.status(400).json({ error: 'ID de juego requerido' });

  try {
    await favoriteModel.addItem(userId, gameId);
    res.json({ message: 'Juego añadido a favoritos' });
  } catch (error) {
    console.error('Error al añadir a favoritos:', error);
    res.status(500).json({ error: 'Error al añadir a favoritos' });
  }
}

async function removeFromWishlist(req, res) {
  const userId = req.user.id;
  const gameId = req.params.gameId;

  try {
    await favoriteModel.removeItem(userId, gameId);
    res.json({ message: 'Juego eliminado de favoritos' });
  } catch (error) {
    console.error('Error al eliminar de favoritos:', error);
    res.status(500).json({ error: 'Error al eliminar de favoritos' });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
