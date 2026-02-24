const { db } = require('../config/db'); 


exports.testSheet = async (req, res) => {
  try {
    // Optional: you can test DB connection here
    const [rows] = await db.query('SELECT 1 AS test');
    
    res.status(200).json({
      success: true,
      message: "Sheet test route running successfully",
      databaseStatus: "connected",
      // you can remove databaseStatus if you don't want to show it
    });
  } catch (error) {
    console.error('Test route error:', error);
    res.status(500).json({
      success: false,
      message: "Test route failed",
      error: error.message
    });
  }
};





exports.createSheet = async (req, res) => {
  const {
    sheetName,
    customerName,
    poNumber,
    poDate,
    certNo,
    certDate,
    deliveryNoteNo,
    deliveryDate,
    formatNo,
    crNo,
  } = req.body;

  // Required fields validation
  if (!sheetName?.trim() || !customerName?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Sheet name and Customer name are required',
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO sheet_details (
        sheet_name, 
        customer_name, 
        po_number, 
        po_date, 
        cert_no, 
        cert_date,
        delivery_note_no, 
        delivery_date, 
        format_no, 
        cr_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sheetName.trim(),
        customerName.trim(),
        poNumber || null,
        poDate || null,
        certNo || null,
        certDate || null,
        deliveryNoteNo || null,
        deliveryDate || null,
        formatNo || null,
        crNo || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Sheet created successfully',
      sheetId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating sheet:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A sheet with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create sheet',
      error: error.message,
    });
  }
};





exports.getAllSheets = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        sheet_name,
        customer_name,
        po_number,
        po_date,
        cert_no,
        cert_date,
        delivery_note_no,
        delivery_date,
        format_no,
        cr_no,
        created_at
      FROM sheet_details
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      sheets: rows,
    });
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sheets',
      error: error.message,
    });
  }
};

// Optional: Get single sheet by ID (bonus)
exports.getSheetById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM sheet_details WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Sheet not found',
      });
    }

    res.status(200).json({
      success: true,
      sheet: rows[0],
    });
  } catch (error) {
    console.error('Error fetching sheet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};













exports.createRecord = async (req, res) => {
  try {
    const {
      tc_no, heat_no, size,
      c, cr, ni, mo, mn, si, s, p,
      material_grade
    } = req.body;

    if (!tc_no?.trim() || !heat_no?.trim() || !size?.trim() || !material_grade?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'TC No, Heat No, Size, and Material Grade are required'
      });
    }

    const [result] = await db.query(
      `INSERT INTO records (
        tc_no, heat_no, size, c, cr, ni, mo, mn, si, s, p, material_grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tc_no.trim(),
        heat_no.trim(),
        size.trim(),
        c || null,
        cr || null,
        ni || null,
        mo || null,
        mn || null,
        si || null,
        s || null,
        p || null,
        material_grade.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      recordId: result.insertId
    });
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create record',
      error: error.message
    });
  }
};

exports.createMultipleRecords = async (req, res) => {
  try {
    const records = req.body; // expect array of objects

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of records'
      });
    }

    const values = records.map(r => [
      r.tc_no?.trim() || '',
      r.heat_no?.trim() || '',
      r.size?.trim() || '',
      r.c || null,
      r.cr || null,
      r.ni || null,
      r.mo || null,
      r.mn || null,
      r.si || null,
      r.s || null,
      r.p || null,
      r.material_grade?.trim() || ''
    ]);

    const [result] = await db.query(
      `INSERT INTO records (
        tc_no, heat_no, size, c, cr, ni, mo, mn, si, s, p, material_grade
      ) VALUES ?`,
      [values]
    );

    res.status(201).json({
      success: true,
      message: `Created ${result.affectedRows} records successfully`,
      insertedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create records',
      error: error.message
    });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, tc_no, heat_no, size, 
        c, cr, ni, mo, mn, si, s, p,
        material_grade, created_at, updated_at
      FROM records
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      records: rows
    });
  } catch (error) {
    console.error('Get all records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records',
      error: error.message
    });
  }
};

exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const {
    tc_no, heat_no, size,
    c, cr, ni, mo, mn, si, s, p,
    material_grade
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE records SET
        tc_no = ?, heat_no = ?, size = ?,
        c = ?, cr = ?, ni = ?, mo = ?, mn = ?, si = ?, s = ?, p = ?,
        material_grade = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        tc_no?.trim() || '',
        heat_no?.trim() || '',
        size?.trim() || '',
        c || null,
        cr || null,
        ni || null,
        mo || null,
        mn || null,
        si || null,
        s || null,
        p || null,
        material_grade?.trim() || '',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record updated successfully'
    });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update record',
      error: error.message
    });
  }
};

exports.deleteRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM records WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete record',
      error: error.message
    });
  }
};












// Fetch single record by tc_no (using query param)
exports.getRecordByTcNo = async (req, res) => {
  try {
    const { tc_no } = req.query;

    if (!tc_no || !tc_no.trim()) {
      return res.status(400).json({
        success: false,
        message: 'tc_no is required in query parameters'
      });
    }

    const [rows] = await db.query(
      `SELECT 
        id, tc_no, heat_no, size, 
        c, cr, ni, mo, mn, si, s, p, 
        material_grade, created_at, updated_at 
      FROM records 
      WHERE tc_no = ? 
      LIMIT 1`,
      [tc_no.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No record found with tc_no: ${tc_no}`
      });
    }

    res.status(200).json({
      success: true,
      record: rows[0]
    });
  } catch (error) {
    console.error('Error fetching record by tc_no:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record',
      error: error.message
    });
  }
};