'use strict';

const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// All order routes require authentication
router.use(auth);

// GET /api/orders  — admin: all orders; customer: own orders
router.get('/', getAllOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

// POST /api/orders
router.post('/', createOrder);

// PUT /api/orders/:id/status  — admin only
router.put('/:id/status', checkRole('admin'), updateOrderStatus);

// PUT /api/orders/:id/cancel  — customer cancels own pending order
router.put('/:id/cancel', cancelOrder);

module.exports = router;
