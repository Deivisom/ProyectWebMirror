const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', gameController.getGames);
router.get('/:id', gameController.getGameById);
router.post('/', authMiddleware.verifyToken, gameController.createGame);
router.put('/:id', authMiddleware.verifyToken, gameController.updateGame);
router.delete('/:id', authMiddleware.verifyToken, gameController.deleteGame);

module.exports = router;
