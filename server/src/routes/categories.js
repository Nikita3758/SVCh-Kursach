'use strict';

const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Public
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin only
router.post('/', auth, checkRole('admin'), createCategory);
router.put('/:id', auth, checkRole('admin'), updateCategory);
router.delete('/:id', auth, checkRole('admin'), deleteCategory);

module.exports = router;
