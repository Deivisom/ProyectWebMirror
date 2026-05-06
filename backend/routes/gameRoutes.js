const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', gameController.getGames);
router.get('/:id', gameController.getGameById);
router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, gameController.createGame);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, gameController.updateGame);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, gameController.deleteGame);

module.exports = router;
