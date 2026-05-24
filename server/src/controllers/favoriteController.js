'use strict';

const { Favorite, Product, ProductImage } = require('../models');

// GET /api/favorites
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'stock', 'isActive', 'material'],
          include: [
            {
              model: ProductImage,
              as: 'images',
              where: { isMain: true },
              required: false,
              attributes: ['url'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ favorites });
  } catch (error) {
    console.error('getFavorites error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/favorites
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or not available.' });
    }

    const existing = await Favorite.findOne({
      where: { userId: req.user.id, productId },
    });

    if (existing) {
      return res.status(409).json({ message: 'Product is already in favorites.' });
    }

    const favorite = await Favorite.create({ userId: req.user.id, productId });
    return res.status(201).json({ message: 'Added to favorites.', favorite });
  } catch (error) {
    console.error('addFavorite error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/favorites/:productId
const removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: { userId: req.user.id, productId: req.params.productId },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    await favorite.destroy();
    return res.status(200).json({ message: 'Removed from favorites.' });
  } catch (error) {
    console.error('removeFavorite error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/favorites/check/:productId
const checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      where: { userId: req.user.id, productId: req.params.productId },
    });

    return res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('checkFavorite error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
