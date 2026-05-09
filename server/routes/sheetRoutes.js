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
  deleteCertificate,
  createLimit,
  getAllLimits,
  updateLimit,
  deleteLimit,
  getMaterialGrades,
  getLimitsByMaterialGrade,
  bulkuploadrecords,
  bulkValidateExcel,
  getNextCertNumber,
  getRecordsByTraceabilityNos,
  checkTraceabilityUnique,
  checkTraceabilityNosUnique,
  getPressuresBySizes,
  checkDuplicateDeliveryNote,
  getInspectionCertificatesByCertId,
  upload
} = require('../controllers/sheetController');

// Dynamic fields for multiple PDFs
const uploadFields = Array.from({ length: 100 }, (_, i) => ({
  name: `pdf_${i}`,
  maxCount: 1
}));

// ──────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────

router.get('/test', testSheet);

// ─── Record Routes ───────────────────────────────────────────────
router.post('/records', createRecord);
router.post('/records/bulk', createMultipleRecords);
router.get('/records', getAllRecords);
router.put('/records/:id', updateRecord);
router.delete('/records/:id', deleteRecord);

router.get('/check-traceability-unique', checkTraceabilityUnique);
router.post('/check-traceability-bulk', checkTraceabilityNosUnique);
router.get('/records/by-tc', getRecordByTcNo);

// ─── Certificate Routes (PDF Upload) ─────────────────────────────
router.post('/create-certificate', 
  upload.fields(uploadFields),     
  createCertificate
);

// ─── Bulk Excel Routes ───────────────────────────────────────────
router.post('/bulk-validate', upload.single('file'), bulkValidateExcel);
router.post('/bulk-records', upload.single('file'), bulkuploadrecords);

// ─── Other Routes ────────────────────────────────────────────────
router.get('/get-all-certificates', getAllCertificates);
router.get('/get-certificate/:id', getCertificateById);
router.put('/update-certificate/:id', updateCertificate);
router.delete('/delete-certificate/:id', deleteCertificate);

router.post('/check-delivery-note', checkDuplicateDeliveryNote);

router.get('/material-grades', getMaterialGrades);
router.post('/limits', createLimit);
router.get('/limits', getAllLimits);
router.put('/limits/:id', updateLimit);
router.delete('/limits/:id', deleteLimit);

router.get('/limits-by-grade', getLimitsByMaterialGrade);

router.get('/next-cert-number', getNextCertNumber);
router.get('/records/by-traceabilities', getRecordsByTraceabilityNos);

router.post('/pressures/by-sizes', getPressuresBySizes);
router.get('/get-inspection-certificates', getInspectionCertificatesByCertId);

module.exports = router;