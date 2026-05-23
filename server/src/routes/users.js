'use strict';

const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// All user management routes require admin role
router.use(auth, checkRole('admin'));

// GET /api/users
router.get('/', getAllUsers);

// GET /api/users/:id
router.get('/:id', getUserById);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;
