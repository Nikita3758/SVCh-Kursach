'use strict';

const { Op } = require('sequelize');
const { Order, OrderItem, Product, User, CartItem, Role, sequelize } = require('../models');

// GET /api/orders
const getAllOrders = async (req, res) => {
  try {
    const isAdmin = req.user.role.name === 'admin';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = {};

    if (!isAdmin) {
      // Customers see only their own orders
      where.userId = req.user.id;
    } else {
      // Admin filters
      if (req.query.userId) where.userId = parseInt(req.query.userId);
      if (req.query.status) where.status = req.query.status;
      if (req.query.startDate || req.query.endDate) {
        where.createdAt = {};
        if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
        if (req.query.endDate) {
          const end = new Date(req.query.endDate);
          end.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = end;
        }
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price'],
              include: [
                {
                  model: sequelize.models.ProductImage,
                  as: 'images',
                  attributes: ['url', 'isMain'],
                },
              ],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return res.status(200).json({
      orders: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName', 'phone'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'isActive'],
              include: [
                {
                  model: sequelize.models.ProductImage,
                  as: 'images',
                  attributes: ['url', 'isMain'],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const isAdmin = req.user.role.name === 'admin';
    if (!isAdmin && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { deliveryAddress, notes, items: bodyItems } = req.body;

    let itemsToOrder = [];

    if (Array.isArray(bodyItems) && bodyItems.length > 0) {
      // Use items from request body
      itemsToOrder = bodyItems;
    } else {
      // Use items from cart
      const cartItems = await CartItem.findAll({
        where: { userId: req.user.id },
        include: [{ model: Product, as: 'product' }],
        transaction: t,
      });

      if (cartItems.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Cart is empty and no items provided.' });
      }

      itemsToOrder = cartItems.map((ci) => ({
        productId: ci.productId,
        quantity: ci.quantity,
      }));
    }

    // Validate products and stock
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of itemsToOrder) {
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        await t.rollback();
        return res.status(400).json({ message: `Product with id ${item.productId} not found.` });
      }

      if (!product.isActive) {
        await t.rollback();
        return res.status(400).json({ message: `Product "${product.name}" is no longer available.` });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(product.price),
        product,
      });
    }

    // Create the order
    const order = await Order.create(
      {
        userId: req.user.id,
        status: 'pending',
        totalAmount: totalAmount.toFixed(2),
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
      },
      { transaction: t }
    );

    // Create order items and decrement stock
    for (const item of validatedItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        },
        { transaction: t }
      );

      await item.product.decrement('stock', { by: item.quantity, transaction: t });
    }

    // Clear user's cart
    await CartItem.destroy({ where: { userId: req.user.id }, transaction: t });

    await t.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }],
        },
      ],
    });

    return res.status(201).json({ message: 'Order created successfully.', order: createdOrder });
  } catch (error) {
    await t.rollback();
    console.error('createOrder error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.` });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    await order.update({ status });

    return res.status(200).json({ message: 'Order status updated.', order });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction: t,
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.userId !== req.user.id) {
      await t.rollback();
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ message: 'Only pending orders can be cancelled.' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.increment('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction: t,
      });
    }

    await order.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();

    return res.status(200).json({ message: 'Order cancelled.', order });
  } catch (error) {
    await t.rollback();
    console.error('cancelOrder error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrderStatus, cancelOrder };
