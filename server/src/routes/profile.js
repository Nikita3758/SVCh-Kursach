'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const auth = require('../middleware/auth');

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// All profile routes require authentication
router.use(auth);

// GET /api/profile
router.get('/', getProfile);

// PUT /api/profile
router.put('/', upload.single('avatar'), updateProfile);

// PUT /api/profile/password
router.put('/password', changePassword);

module.exports = router;
