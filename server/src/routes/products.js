'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Multer for product images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Public routes (auth optional for filtering inactive products)
router.get('/', (req, res, next) => {
  // Optionally attach user if token present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
}, getAllProducts);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
}, getProductById);

// Admin-only routes
router.post('/', auth, checkRole('admin'), upload.array('images', 10), createProduct);
router.put('/:id', auth, checkRole('admin'), upload.array('images', 10), updateProduct);
router.delete('/:id', auth, checkRole('admin'), deleteProduct);

module.exports = router;
