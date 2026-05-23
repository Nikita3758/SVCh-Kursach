'use strict';

const { CartItem, Product, ProductImage } = require('../models');
const { literal } = require('sequelize');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'stock', 'isActive'],
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

    const total = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.product.price) * item.quantity;
    }, 0);

    return res.status(200).json({
      cartItems,
      total: parseFloat(total.toFixed(2)),
      itemCount: cartItems.length,
    });
  } catch (error) {
    console.error('getCart error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found or not available.' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: `Only ${product.stock} unit(s) in stock.` });
    }

    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId },
    });

    if (cartItem) {
      const newQty = cartItem.quantity + qty;
      if (product.stock < newQty) {
        return res.status(400).json({ message: `Only ${product.stock} unit(s) in stock.` });
      }
      await cartItem.update({ quantity: newQty });
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId,
        quantity: qty,
      });
    }

    const populated = await CartItem.findByPk(cartItem.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'stock'] }],
    });

    return res.status(200).json({ message: 'Item added to cart.', cartItem: populated });
  } catch (error) {
    console.error('addToCart error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/cart/:id
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (cartItem.product.stock < qty) {
      return res.status(400).json({ message: `Only ${cartItem.product.stock} unit(s) in stock.` });
    }

    await cartItem.update({ quantity: qty });
    return res.status(200).json({ message: 'Cart item updated.', cartItem });
  } catch (error) {
    console.error('updateCartItem error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/cart/:id
const removeCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await cartItem.destroy();
    return res.status(200).json({ message: 'Item removed from cart.' });
  } catch (error) {
    console.error('removeCartItem error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
  try {
    await CartItem.destroy({ where: { userId: req.user.id } });
    return res.status(200).json({ message: 'Cart cleared.' });
  } catch (error) {
    console.error('clearCart error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
