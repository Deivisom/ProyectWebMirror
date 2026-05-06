const gameModel = require('../models/gameModel');

function parsePagination(query) {
  const page = query.page !== undefined ? parseInt(query.page, 10) : undefined;
  const limit = query.limit !== undefined ? parseInt(query.limit, 10) : undefined;
  return {
    page: Number.isNaN(page) ? undefined : page,
    limit: Number.isNaN(limit) ? undefined : limit
  };
}

function validateGamePayload(body) {
  const requiredFields = ['title', 'category', 'tag', 'main_image'];
  const missingFields = requiredFields.filter(field => !body[field]);
  if (missingFields.length) {
    return `Faltan campos obligatorios: ${missingFields.join(', ')}`;
  }
  return null;
}

async function getGames(req, res) {
  try {
    const { page, limit } = parsePagination(req.query);
    const games = await gameModel.findAll({ page, limit });

    if (page !== undefined || limit !== undefined) {
      const total = await gameModel.countAll();
      return res.json({ games, total, page: page || 1, limit: limit || 10 });
    }

    return res.json(games);
  } catch (error) {
    console.error('Error al obtener los juegos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function getGameById(req, res) {
  try {
    const game = await gameModel.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json(game);
  } catch (error) {
    console.error('Error al obtener el juego:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function createGame(req, res) {
  try {
    const validationError = validateGamePayload(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const newGame = {
      title: req.body.title,
      category: req.body.category,
      tag: req.body.tag,
      main_image: req.body.main_image,
      price: req.body.price || null,
      original_price: req.body.original_price || null,
      final_price: req.body.final_price || null,
      discount: req.body.discount || null,
      screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : []
    };

    const insertId = await gameModel.create(newGame);
    return res.status(201).json({ id: insertId, message: 'Juego creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el juego:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function updateGame(req, res) {
  try {
    const gameExists = await gameModel.findById(req.params.id);
    if (!gameExists) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    const updatedGame = {
      title: req.body.title ?? gameExists.title,
      category: req.body.category ?? gameExists.category,
      tag: req.body.tag ?? gameExists.tag,
      main_image: req.body.main_image ?? gameExists.main_image,
      price: req.body.price ?? gameExists.price,
      original_price: req.body.original_price ?? gameExists.original_price,
      final_price: req.body.final_price ?? gameExists.final_price,
      discount: req.body.discount ?? gameExists.discount,
      screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : gameExists.screenshots
    };

    const affectedRows = await gameModel.update(req.params.id, updatedGame);
    if (!affectedRows) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    return res.json({ message: 'Juego actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el juego:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function deleteGame(req, res) {
  try {
    const affectedRows = await gameModel.remove(req.params.id);
    if (!affectedRows) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }
    return res.json({ message: 'Juego eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
};
