const express = require('express');
const router = express.Router();
const { testAuth ,login} = require('../controllers/authController');




router.get('/test', testAuth);

router.post('/login', login);




module.exports = router;