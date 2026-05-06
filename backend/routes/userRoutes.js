const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/cart', authMiddleware.verifyToken, userController.getCart);
router.post('/cart', authMiddleware.verifyToken, userController.addCartItem);
router.delete('/cart/:gameId', authMiddleware.verifyToken, userController.removeCartItem);

router.get('/favorites', authMiddleware.verifyToken, userController.getFavorites);
router.post('/favorites', authMiddleware.verifyToken, userController.addFavorite);
router.delete('/favorites/:gameId', authMiddleware.verifyToken, userController.removeFavorite);

module.exports = router;
