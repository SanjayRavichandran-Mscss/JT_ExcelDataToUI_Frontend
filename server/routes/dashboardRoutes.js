const express = require('express');
const router = express.Router();
const {testDashboard ,getDashboardData,saveTarget,getCertificateStats} = require('../controllers/dashboardController');

// All dashboard routes are protected

// Test route
router.get('/test', testDashboard);
router.get('/data', getDashboardData);
// CRUD Operations


router.post('/save', saveTarget);           // Save only target count
router.get('/stats', getCertificateStats);


module.exports = router;