const express = require('express');
const router = express.Router();
const {testDashboard ,getDashboardData} = require('../controllers/dashboardController');

// All dashboard routes are protected

// Test route
router.get('/test', testDashboard);
router.get('/data', getDashboardData);


module.exports = router;