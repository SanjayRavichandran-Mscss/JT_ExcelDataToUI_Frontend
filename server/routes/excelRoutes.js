const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const excelController = require('../controllers/excelController');

router.post('/upload', upload.single('file'), excelController.uploadExcel);
router.post('/store', excelController.storeData);

module.exports = router;