'use strict';

const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/profile', require('./profile'));
router.use('/products', require('./products'));
router.use('/categories', require('./categories'));
router.use('/orders', require('./orders'));
router.use('/cart', require('./cart'));
router.use('/favorites', require('./favorites'));
router.use('/reviews', require('./reviews'));
router.use('/reports', require('./reports'));

module.exports = router;
