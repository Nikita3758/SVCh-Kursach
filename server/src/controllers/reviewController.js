'use strict';

const { Review, Product, User } = require('../models');

// GET /api/reviews/product/:productId  (public)
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : null;

    return res.status(200).json({ reviews, avgRating, total: reviews.length });
  } catch (error) {
    console.error('getProductReviews error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/reviews/product/:productId
const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: 'Rating is required.' });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const product = await Product.findByPk(req.params.productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const existing = await Review.findOne({
      where: { userId: req.user.id, productId: req.params.productId },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product. Update your existing review.' });
    }

    const review = await Review.create({
      userId: req.user.id,
      productId: parseInt(req.params.productId),
      rating: ratingNum,
      comment: comment || null,
    });

    const populated = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });

    return res.status(201).json({ message: 'Review added.', review: populated });
  } catch (error) {
    console.error('createReview error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/reviews/:id
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }

    const { rating, comment } = req.body;
    const updates = {};

    if (rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      }
      updates.rating = ratingNum;
    }

    if (comment !== undefined) updates.comment = comment;

    await review.update(updates);

    const updated = await Review.findByPk(review.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
    });

    return res.status(200).json({ message: 'Review updated.', review: updated });
  } catch (error) {
    console.error('updateReview error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const isAdmin = req.user.role.name === 'admin';

    if (!isAdmin && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }

    await review.destroy();
    return res.status(200).json({ message: 'Review deleted.' });
  } catch (error) {
    console.error('deleteReview error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProductReviews, createReview, updateReview, deleteReview };
