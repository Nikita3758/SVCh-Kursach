'use strict';

const express = require('express');
const router = express.Router();
const { getFavorites, addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

// All favorites routes require authentication
router.use(auth);

// GET /api/favorites
router.get('/', getFavorites);

// GET /api/favorites/check/:productId  — must be before /:productId to avoid param conflict
router.get('/check/:productId', checkFavorite);

// POST /api/favorites
router.post('/', addFavorite);

// DELETE /api/favorites/:productId
router.delete('/:productId', removeFavorite);

module.exports = router;
