'use strict';

const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/auth');

// All cart routes require authentication
router.use(auth);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart
router.post('/', addToCart);

// PUT /api/cart/:id
router.put('/:id', updateCartItem);

// DELETE /api/cart/:id  — remove single item
router.delete('/:id', removeCartItem);

// DELETE /api/cart  — clear entire cart
router.delete('/', clearCart);

module.exports = router;
