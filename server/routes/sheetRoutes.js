const express = require('express');
const router = express.Router();

const {
  testSheet,
  createSheet,
  getAllSheets,
  getSheetById,
  createRecord,
  createMultipleRecords,
  getAllRecords,
  updateRecord,
  deleteRecord,
  getRecordByTcNo
} = require('../controllers/sheetController');

// ─── Sheet Routes ────────────────────────────────────────────────
router.get('/test', testSheet);                     // GET /api/sheet/test
router.post('/create', createSheet);                // POST /api/sheet/create
router.get('/sheets', getAllSheets);                // GET /api/sheet/sheets   ← all sheets
router.get('/sheets/:id', getSheetById);            // GET /api/sheet/sheets/:id

// ─── Record Routes ───────────────────────────────────────────────
router.post('/records', createRecord);              // POST   /api/sheet/records
router.post('/records/bulk', createMultipleRecords);// POST   /api/sheet/records/bulk
router.get('/records', getAllRecords);              // GET    /api/sheet/records     ← all records
router.put('/records/:id', updateRecord);           // PUT    /api/sheet/records/:id
router.delete('/records/:id', deleteRecord);        // DELETE /api/sheet/records/:id


router.get('/records/by-tc', getRecordByTcNo);          // GET /api/sheet/records/by-tc?tc_no=ABC123

module.exports = router;