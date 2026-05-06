const express = require('express');
const router = express.Router();
const userActionsController = require('../controllers/userActionsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rutas protegidas para el carrito
router.get('/cart', verifyToken, userActionsController.getCart);
router.post('/cart', verifyToken, userActionsController.addToCart);
router.delete('/cart/:gameId', verifyToken, userActionsController.removeFromCart);

// Rutas protegidas para favoritos
router.get('/favorites', verifyToken, userActionsController.getWishlist);
router.post('/favorites', verifyToken, userActionsController.addToWishlist);
router.delete('/favorites/:gameId', verifyToken, userActionsController.removeFromWishlist);

module.exports = router;
