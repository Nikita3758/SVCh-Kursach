'use strict';

const express = require('express');
const router = express.Router();
const { getProductReviews, createReview, updateReview, deleteReview } = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// GET /api/reviews/product/:productId  — public
router.get('/product/:productId', getProductReviews);

// POST /api/reviews/product/:productId  — authenticated
router.post('/product/:productId', auth, createReview);

// PUT /api/reviews/:id  — authenticated (own review)
router.put('/:id', auth, updateReview);

// DELETE /api/reviews/:id  — authenticated (own or admin)
router.delete('/:id', auth, deleteReview);

module.exports = router;
