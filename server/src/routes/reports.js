'use strict';

const express = require('express');
const router = express.Router();
const { getDashboard, getSalesReport, getInventoryReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// All report routes require admin role
router.use(auth, checkRole('admin'));

// GET /api/reports/dashboard
router.get('/dashboard', getDashboard);

// GET /api/reports/sales?startDate=&endDate=&format=json|pdf|docx
router.get('/sales', getSalesReport);

// GET /api/reports/inventory?format=json|pdf|docx
router.get('/inventory', getInventoryReport);

module.exports = router;
