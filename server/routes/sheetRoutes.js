const express = require('express');
const router = express.Router();

const {
  testSheet,
  createRecord,
  createMultipleRecords,
  getAllRecords,
  updateRecord,
  deleteRecord,
  getRecordByTcNo,
  createCertificate,
  getAllCertificates,
  getCertificateById,
  updateCertificate,
  deleteCertificate
} = require('../controllers/sheetController');

// ─── Sheet Routes ────────────────────────────────────────────────
router.get('/test', testSheet);                     // GET /api/sheet/test

// ─── Record Routes ───────────────────────────────────────────────
router.post('/records', createRecord);              // POST   /api/sheet/records
router.post('/records/bulk', createMultipleRecords);// POST   /api/sheet/records/bulk
router.get('/records', getAllRecords);              // GET    /api/sheet/records     ← all records
router.put('/records/:id', updateRecord);           // PUT    /api/sheet/records/:id
router.delete('/records/:id', deleteRecord);        // DELETE /api/sheet/records/:id


router.get('/records/by-tc', getRecordByTcNo);          // GET /api/sheet/records/by-tc?tc_no=ABC123











// Individual Route Definitions
router.post('/create-certificate', createCertificate);
router.get('/get-all-certificates', getAllCertificates);
router.get('/get-certificate/:id', getCertificateById);
router.put('/update-certificate/:id', updateCertificate);
router.delete('/delete-certificate/:id', deleteCertificate);

module.exports = router;