const { db } = require('../config/db'); 
const XLSX = require('xlsx');

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
exports.createRecord = async (req, res) => {
  try {
    const {
      tc_no, heat_no, size,
      c, cr, ni, mo, mn, si, s, p,
      cu, fe, co,               // ← new fields
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
        tc_no, heat_no, size, 
        c, cr, ni, mo, mn, si, s, p, 
        cu, fe, co,               -- ← added
        material_grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        cu || null,               // ← added
        fe || null,               // ← added
        co || null,               // ← added
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
      r.cu || null,               // ← added
      r.fe || null,               // ← added
      r.co || null,               // ← added
      r.material_grade?.trim() || ''
    ]);

    const [result] = await db.query(
      `INSERT INTO records (
        tc_no, heat_no, size, 
        c, cr, ni, mo, mn, si, s, p, 
        cu, fe, co,               -- ← added
        material_grade
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
        cu, fe, co,               -- ← added
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
    cu, fe, co,               // ← added
    material_grade
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE records SET
        tc_no = ?, heat_no = ?, size = ?,
        c = ?, cr = ?, ni = ?, mo = ?, mn = ?, si = ?, s = ?, p = ?,
        cu = ?, fe = ?, co = ?,           -- ← added
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
        cu || null,               // ← added
        fe || null,               // ← added
        co || null,               // ← added
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
        cu, fe, co,               -- ← added
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





exports.createCertificate = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            cert_no,
            cert_date,
            delivery_note_no,
            delivery_date,
            customer_name,
            po_no,
            po_date,
            items = [],
            signature = 0   // default to 0 (none)
        } = req.body;

        // 1. Insert header
        const [headerResult] = await connection.query(
            `INSERT INTO certificate_details 
             (cert_no, cert_date, delivery_note_no, delivery_date, customer_name, po_no, po_date, signature)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [cert_no, cert_date, delivery_note_no, delivery_date, customer_name, po_no, po_date, signature]
        );

        const certificate_id = headerResult.insertId;

        // 2. Insert items if any
        if (items.length > 0) {
            const itemValues = items.map(item => [
                certificate_id,
                item.po_lineitem_no,
                item.item_size,
                item.raw_material_size,
                item.tc_no,
                item.traceability_no,
                item.qty_pcs,
                item.material_grade,
                item.c,
                item.cr,
                item.ni,
                item.mo,
                item.mn,
                item.si,
                item.s,
                item.p,
                item.cu || '',  // New field
                item.fe || '',  // New field
                item.co || ''   // New field
            ]);

            await connection.query(
                `INSERT INTO certificate_records (
                    certificate_id, po_lineitem_no, item_size, raw_material_size,
                    tc_no, traceability_no, qty_pcs, material_grade,
                    c, cr, ni, mo, mn, si, s, p, cu, fe, co
                ) VALUES ?`,
                [itemValues]
            );
        }

        await connection.commit();
        res.status(201).json({
            success: true,
            message: "Certificate created",
            certificateId: certificate_id
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create certificate error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
};
// Update Certificate
exports.updateCertificate = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            cert_no,
            cert_date,
            delivery_note_no,
            delivery_date,
            customer_name,
            po_no,
            po_date,
            signature = 0,
            items = [],           // array of objects from frontend
        } = req.body;

        // 1. Update header (always)
        await connection.query(
            `UPDATE certificate_details 
             SET cert_no       = ?,
                 cert_date     = ?,
                 delivery_note_no = ?,
                 delivery_date = ?,
                 customer_name = ?,
                 po_no         = ?,
                 po_date       = ?,
                 signature     = ?
             WHERE id = ?`,
            [cert_no, cert_date, delivery_note_no, delivery_date, customer_name, po_no, po_date, signature, id]
        );

        // 2. Get current items from DB (to know what to delete/update/insert)
        const [existingItems] = await connection.query(
            `SELECT id FROM certificate_records WHERE certificate_id = ?`,
            [id]
        );

        const existingIds = new Set(existingItems.map(row => row.id));

        // 3. Process incoming items
        for (const item of items) {
            if (item.id) {
                // Update existing record
                await connection.query(
                    `UPDATE certificate_records 
                     SET po_lineitem_no    = ?,
                         item_size         = ?,
                         raw_material_size = ?,
                         tc_no             = ?,
                         traceability_no   = ?,
                         qty_pcs           = ?,
                         material_grade    = ?,
                         c                 = ?,
                         cr                = ?,
                         ni                = ?,
                         mo                = ?,
                         mn                = ?,
                         si                = ?,
                         s                 = ?,
                         p                 = ?,
                         cu                = ?,
                         fe                = ?,
                         co                = ?
                     WHERE id = ? AND certificate_id = ?`,
                    [
                        item.po_lineitem_no || null,
                        item.item_size || null,
                        item.raw_material_size || null,
                        item.tc_no || null,
                        item.traceability_no || null,
                        item.qty_pcs || null,
                        item.material_grade || null,
                        item.c || null,
                        item.cr || null,
                        item.ni || null,
                        item.mo || null,
                        item.mn || null,
                        item.si || null,
                        item.s || null,
                        item.p || null,
                        item.cu || null,  // New field
                        item.fe || null,  // New field
                        item.co || null,  // New field
                        item.id,
                        id
                    ]
                );

                existingIds.delete(item.id); // mark as kept
            } else {
                // Insert new item
                await connection.query(
                    `INSERT INTO certificate_records (
                        certificate_id, po_lineitem_no, item_size, raw_material_size,
                        tc_no, traceability_no, qty_pcs, material_grade,
                        c, cr, ni, mo, mn, si, s, p, cu, fe, co
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        item.po_lineitem_no || null,
                        item.item_size || null,
                        item.raw_material_size || null,
                        item.tc_no || null,
                        item.traceability_no || null,
                        item.qty_pcs || null,
                        item.material_grade || null,
                        item.c || null,
                        item.cr || null,
                        item.ni || null,
                        item.mo || null,
                        item.mn || null,
                        item.si || null,
                        item.s || null,
                        item.p || null,
                        item.cu || null,  // New field
                        item.fe || null,  // New field
                        item.co || null   // New field
                    ]
                );
            }
        }

        // 4. Delete items that were removed (still in existingIds)
        if (existingIds.size > 0) {
            const idsToDelete = Array.from(existingIds);
            await connection.query(
                `DELETE FROM certificate_records 
                 WHERE id IN (${idsToDelete.map(() => '?').join(',')}) 
                 AND certificate_id = ?`,
                [...idsToDelete, id]
            );
        }

        await connection.commit();
        res.status(200).json({ success: true, message: "Certificate updated successfully" });
    } catch (error) {
        await connection.rollback();
        console.error('Update certificate error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
};

// Get All Certificates (Summary)
exports.getAllCertificates = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT h.*, COUNT(r.id) as item_count 
            FROM certificate_details h 
            LEFT JOIN certificate_records r ON h.id = r.certificate_id 
            GROUP BY h.id 
            ORDER BY h.created_at DESC
        `);
        res.status(200).json({ success: true, certificates: rows });
    } catch (error) {
        console.error('Get all certificates error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get Certificate By ID (with all items including new fields)
exports.getCertificateById = async (req, res) => {
    try {
        const [headers] = await db.query(
            "SELECT * FROM certificate_details WHERE id = ?",
            [req.params.id]
        );

        if (headers.length === 0) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        const [items] = await db.query(
            "SELECT * FROM certificate_records WHERE certificate_id = ?",
            [req.params.id]
        );

        res.status(200).json({
            success: true,
            data: {
                ...headers[0],
                items
            }
        });
    } catch (error) {
        console.error('Get certificate by id error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getCertificateById = async (req, res) => {
    try {
        const [headers] = await db.query(
            "SELECT * FROM certificate_details WHERE id = ?",
            [req.params.id]
        );

        if (headers.length === 0) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        const [items] = await db.query(
            "SELECT * FROM certificate_records WHERE certificate_id = ?",
            [req.params.id]
        );

        res.status(200).json({
            success: true,
            data: {
                ...headers[0],
                items
            }
        });
    } catch (error) {
        console.error('Get certificate by id error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteCertificate = async (req, res) => {
    const { id } = req.params;
    try {
        // Optional: also delete related records
        await db.query("DELETE FROM certificate_records WHERE certificate_id = ?", [id]);
        const [result] = await db.query("DELETE FROM certificate_details WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Certificate not found" });
        }

        res.status(200).json({ success: true, message: "Certificate deleted successfully" });
    } catch (error) {
        console.error('Delete certificate error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
































// ==================== MATERIAL GRADE MASTER ====================
exports.getMaterialGrades = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, material_grade 
       FROM material_grade_master 
       ORDER BY material_grade ASC`
    );

    res.json({
      success: true,
      grades: rows
    });
  } catch (error) {
    console.error('Get material grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material grades',
      error: error.message
    });
  }
};

// ==================== RECORDS MIN-MAX LIMITS ====================
exports.createLimit = async (req, res) => {
  try {
    const {
      material_grade_id,
      c_min, c_max, cr_min, cr_max, ni_min, ni_max,
      mo_min, mo_max, mn_min, mn_max, si_min, si_max,
      s_min, s_max, p_min, p_max, cu_min, cu_max,
      fe_min, fe_max, co_min, co_max
    } = req.body;

    if (!material_grade_id) {
      return res.status(400).json({
        success: false,
        message: "Material Grade ID is required"
      });
    }

    const [result] = await db.query(
      `INSERT INTO records_min_max_values (
        material_grade_id, c_min, c_max, cr_min, cr_max, ni_min, ni_max,
        mo_min, mo_max, mn_min, mn_max, si_min, si_max,
        s_min, s_max, p_min, p_max, cu_min, cu_max,
        fe_min, fe_max, co_min, co_max
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        material_grade_id,
        c_min || null, c_max || null,
        cr_min || null, cr_max || null,
        ni_min || null, ni_max || null,
        mo_min || null, mo_max || null,
        mn_min || null, mn_max || null,
        si_min || null, si_max || null,
        s_min || null, s_max || null,
        p_min || null, p_max || null,
        cu_min || null, cu_max || null,
        fe_min || null, fe_max || null,
        co_min || null, co_max || null
      ]
    );

    // Optional: fetch the newly created record with joined material_grade
    const [newRecord] = await db.query(
      `SELECT 
         l.id, m.material_grade, l.material_grade_id,
         l.c_min, l.c_max, l.cr_min, l.cr_max,
         l.ni_min, l.ni_max, l.mo_min, l.mo_max,
         l.mn_min, l.mn_max, l.si_min, l.si_max,
         l.s_min, l.s_max, l.p_min, l.p_max,
         l.cu_min, l.cu_max, l.fe_min, l.fe_max,
         l.co_min, l.co_max, l.created_at, l.updated_at
       FROM records_min_max_values l
       JOIN material_grade_master m ON l.material_grade_id = m.id
       WHERE l.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Material limit created successfully",
      data: newRecord[0] || { id: result.insertId }
    });
  } catch (error) {
    console.error('Create limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material limit',
      error: error.message
    });
  }
};

exports.getAllLimits = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id,
        m.material_grade,
        l.material_grade_id,
        l.c_min, l.c_max, l.cr_min, l.cr_max,
        l.ni_min, l.ni_max, l.mo_min, l.mo_max,
        l.mn_min, l.mn_max, l.si_min, l.si_max,
        l.s_min, l.s_max, l.p_min, l.p_max,
        l.cu_min, l.cu_max, l.fe_min, l.fe_max,
        l.co_min, l.co_max,
        l.created_at, l.updated_at
      FROM records_min_max_values l
      JOIN material_grade_master m ON l.material_grade_id = m.id
      ORDER BY m.material_grade ASC
    `);

    res.json({
      success: true,
      count: rows.length,
      limits: rows
    });
  } catch (error) {
    console.error('Get limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material limits',
      error: error.message
    });
  }
};

exports.updateLimit = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      material_grade_id,
      c_min, c_max, cr_min, cr_max, ni_min, ni_max,
      mo_min, mo_max, mn_min, mn_max, si_min, si_max,
      s_min, s_max, p_min, p_max, cu_min, cu_max,
      fe_min, fe_max, co_min, co_max
    } = req.body;

    if (!material_grade_id) {
      return res.status(400).json({
        success: false,
        message: "Material Grade ID is required"
      });
    }

    const [result] = await db.query(
      `UPDATE records_min_max_values SET
        material_grade_id = ?,
        c_min = ?, c_max = ?, cr_min = ?, cr_max = ?,
        ni_min = ?, ni_max = ?, mo_min = ?, mo_max = ?,
        mn_min = ?, mn_max = ?, si_min = ?, si_max = ?,
        s_min = ?, s_max = ?, p_min = ?, p_max = ?,
        cu_min = ?, cu_max = ?, fe_min = ?, fe_max = ?,
        co_min = ?, co_max = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        material_grade_id,
        c_min || null, c_max || null,
        cr_min || null, cr_max || null,
        ni_min || null, ni_max || null,
        mo_min || null, mo_max || null,
        mn_min || null, mn_max || null,
        si_min || null, si_max || null,
        s_min || null, s_max || null,
        p_min || null, p_max || null,
        cu_min || null, cu_max || null,
        fe_min || null, fe_max || null,
        co_min || null, co_max || null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Material limit not found"
      });
    }

    // Optional: return updated record with joined name
    const [updatedRecord] = await db.query(
      `SELECT 
         l.id, m.material_grade, l.material_grade_id,
         l.c_min, l.c_max, l.cr_min, l.cr_max,
         l.ni_min, l.ni_max, l.mo_min, l.mo_max,
         l.mn_min, l.mn_max, l.si_min, l.si_max,
         l.s_min, l.s_max, l.p_min, l.p_max,
         l.cu_min, l.cu_max, l.fe_min, l.fe_max,
         l.co_min, l.co_max, l.created_at, l.updated_at
       FROM records_min_max_values l
       JOIN material_grade_master m ON l.material_grade_id = m.id
       WHERE l.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Material limit updated successfully",
      data: updatedRecord[0] || {}
    });
  } catch (error) {
    console.error('Update limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material limit',
      error: error.message
    });
  }
};

exports.deleteLimit = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM records_min_max_values WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Material limit not found"
      });
    }

    res.json({
      success: true,
      message: "Material limit deleted successfully"
    });
  } catch (error) {
    console.error('Delete limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material limit',
      error: error.message
    });
  }
};





// In sheetController.js
exports.getLimitsByMaterialGrade = async (req, res) => {
  try {
    const { material_grade } = req.query;

    if (!material_grade?.trim()) {
      return res.status(400).json({
        success: false,
        message: "material_grade query parameter is required"
      });
    }

    const [rows] = await db.query(`
      SELECT 
        l.c_min, l.c_max, l.cr_min, l.cr_max,
        l.ni_min, l.ni_max, l.mo_min, l.mo_max,
        l.mn_min, l.mn_max, l.si_min, l.si_max,
        l.s_min, l.s_max, l.p_min, l.p_max,
        l.cu_min, l.cu_max, l.fe_min, l.fe_max,
        l.co_min, l.co_max
      FROM records_min_max_values l
      JOIN material_grade_master m ON l.material_grade_id = m.id
      WHERE m.material_grade = ?
      LIMIT 1
    `, [material_grade.trim()]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No min/max limits found for material grade: ${material_grade}`
      });
    }

    res.json({
      success: true,
      limits: rows[0]
    });
  } catch (error) {
    console.error('Get limits by grade error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch limits',
      error: error.message
    });
  }
};















exports.bulkValidateExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // ─── Parse Excel ────────────────────────────────────────────────
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });

    if (rawRows.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no data rows'
      });
    }

    // Try to locate the header row (look for something like "tc_no")
    let headerIndex = 0;
    while (headerIndex < rawRows.length) {
      const row = rawRows[headerIndex];
      if (row && row.some(cell => cell && String(cell).toLowerCase().includes('tc_no'))) {
        break;
      }
      headerIndex++;
    }

    if (headerIndex >= rawRows.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'Could not find header row containing "tc_no"'
      });
    }

    const dataRows = rawRows.slice(headerIndex + 1);

    const validationResults = [];

    // Fetch all material grades + their limits
    const [gradeData] = await db.query(`
      SELECT 
        m.id AS material_grade_id,
        m.material_grade,
        l.c_min, l.c_max, l.cr_min, l.cr_max,
        l.ni_min, l.ni_max, l.mo_min, l.mo_max,
        l.mn_min, l.mn_max, l.si_min, l.si_max,
        l.s_min,  l.s_max,  l.p_min,  l.p_max,
        l.cu_min, l.cu_max, l.fe_min, l.fe_max,
        l.co_min, l.co_max
      FROM material_grade_master m
      LEFT JOIN records_min_max_values l ON m.id = l.material_grade_id
    `);

    const gradeMap = {};
    gradeData.forEach(row => {
      if (row.material_grade_id) {
        gradeMap[row.material_grade_id] = row;
      }
    });

    // ─── Validate each row ──────────────────────────────────────────
    dataRows.forEach((row, idx) => {
      const rowNum = headerIndex + idx + 2;

      // Column mapping (0-based index)
      // A = 0 → s.no
      // B = 1 → material_grade_id (number!)
      // C = 2 → tc_no
      // D = 3 → heat_no
      // E = 4 → size
      // F = 5 → c
      // G = 6 → cr
      // H = 7 → ni
      // I = 8 → mo
      // J = 9 → mn
      // K =10 → si
      // L =11 → s
      // M =12 → p
      // N =13 → cu
      // O =14 → fe
      // P =15 → co

      const material_grade_id_raw = row[1];
      const tc_no   = row[2] ? String(row[2]).trim() : '';
      const heat_no = row[3] ? String(row[3]).trim() : '';
      const size    = row[4] ? String(row[4]).trim() : '';

      const chem = {
        c:  row[5],  cr: row[6],  ni: row[7],  mo: row[8],
        mn: row[9],  si: row[10], s:  row[11], p:  row[12],
        cu: row[13], fe: row[14], co: row[15]
      };

      let material_grade_id = null;
      if (material_grade_id_raw != null && !isNaN(Number(material_grade_id_raw))) {
        material_grade_id = Number(material_grade_id_raw);
      }

      // Required fields check
      if (!tc_no || !heat_no || !size || material_grade_id === null) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          message: 'Missing required fields: TC No, Heat No, Size or valid Material Grade ID'
        });
        return;
      }

      const gradeInfo = gradeMap[material_grade_id];

      if (!gradeInfo) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          message: `Material grade ID ${material_grade_id} not found in database`
        });
        return;
      }

      const material_grade_name = gradeInfo.material_grade;

      // ─── Chemical composition validation ────────────────────────
      const fieldChecks = [
        { name: 'C',  key: 'c',   val: chem.c  },
        { name: 'Cr', key: 'cr',  val: chem.cr },
        { name: 'Ni', key: 'ni',  val: chem.ni },
        { name: 'Mo', key: 'mo',  val: chem.mo },
        { name: 'Mn', key: 'mn',  val: chem.mn },
        { name: 'Si', key: 'si',  val: chem.si },
        { name: 'S',  key: 's',   val: chem.s  },
        { name: 'P',  key: 'p',   val: chem.p  },
        { name: 'Cu', key: 'cu',  val: chem.cu },
        { name: 'Fe', key: 'fe',  val: chem.fe },
        { name: 'Co', key: 'co',  val: chem.co }
      ];

      const rowErrors = [];

      fieldChecks.forEach(f => {
        if (f.val == null || f.val === '') return; // empty = skip (allowed)

        const num = parseFloat(f.val);
        if (isNaN(num)) {
          rowErrors.push(`${f.name}: invalid number (${f.val})`);
          return;
        }

        const minRaw = gradeInfo[`${f.key}_min`];
        const maxRaw = gradeInfo[`${f.key}_max`];

        const minVal = minRaw !== null ? parseFloat(minRaw) : null;
        const maxVal = maxRaw !== null ? parseFloat(maxRaw) : null;

        if (minVal !== null && maxVal !== null && (num < minVal || num > maxVal)) {
          rowErrors.push(`${f.name}: ${num} is outside allowed range (${minRaw} – ${maxRaw})`);
        }
      });

      if (rowErrors.length > 0) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          message: rowErrors.join(' | ')
        });
      } else {
        validationResults.push({
          row: rowNum,
          status: 'success',
          message: 'All values within specification limits'
        });
      }
    });

    // ─── Final response ─────────────────────────────────────────────
    const allValid = validationResults.every(r => r.status === 'success');

    res.json({
      success: true,
      validationResults,
      allValid,
      totalRows: dataRows.length,
      validCount: validationResults.filter(r => r.status === 'success').length,
      invalidCount: validationResults.filter(r => r.status === 'error').length,
      message: allValid
        ? 'All rows passed validation — ready to import'
        : 'Some rows have validation issues — please correct the Excel file'
    });

  } catch (err) {
    console.error('Bulk validate error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during validation',
      error: err.message
    });
  }
};

exports.bulkuploadrecords = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false
    });

    if (rawRows.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no data rows'
      });
    }

    let headerIndex = 0;
    while (headerIndex < rawRows.length) {
      const row = rawRows[headerIndex];
      if (row && row.some(cell => cell && String(cell).toLowerCase().includes('tc_no'))) {
        break;
      }
      headerIndex++;
    }

    if (headerIndex >= rawRows.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'Could not find header row containing "tc_no"'
      });
    }

    const dataRows = rawRows.slice(headerIndex + 1);

    const validationResults = [];
    const validRecords = [];

    // Fetch grade info by ID
    const [gradeData] = await db.query(`
      SELECT 
        m.id AS material_grade_id,
        m.material_grade,
        l.c_min, l.c_max, l.cr_min, l.cr_max,
        l.ni_min, l.ni_max, l.mo_min, l.mo_max,
        l.mn_min, l.mn_max, l.si_min, l.si_max,
        l.s_min,  l.s_max,  l.p_min,  l.p_max,
        l.cu_min, l.cu_max, l.fe_min, l.fe_max,
        l.co_min, l.co_max
      FROM material_grade_master m
      LEFT JOIN records_min_max_values l ON m.id = l.material_grade_id
    `);

    const gradeMap = {};
    gradeData.forEach(row => {
      if (row.material_grade_id) gradeMap[row.material_grade_id] = row;
    });

    dataRows.forEach((row, idx) => {
      const rowNum = headerIndex + idx + 2;

      const material_grade_id_raw = row[1];
      const tc_no   = row[2] ? String(row[2]).trim() : '';
      const heat_no = row[3] ? String(row[3]).trim() : '';
      const size    = row[4] ? String(row[4]).trim() : '';

      const chem = {
        c: row[5], cr: row[6], ni: row[7], mo: row[8],
        mn: row[9], si: row[10], s: row[11], p: row[12],
        cu: row[13], fe: row[14], co: row[15]
      };

      let material_grade_id = null;
      if (material_grade_id_raw != null && !isNaN(Number(material_grade_id_raw))) {
        material_grade_id = Number(material_grade_id_raw);
      }

      if (!tc_no || !heat_no || !size || material_grade_id === null) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          message: 'Missing TC No, Heat No, Size or valid Material Grade ID'
        });
        return;
      }

      const gradeInfo = gradeMap[material_grade_id];

      if (!gradeInfo) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          message: `Material grade ID ${material_grade_id} not found`
        });
        return;
      }

      const fieldChecks = [
        { key: 'c',   val: chem.c  },
        { key: 'cr',  val: chem.cr },
        { key: 'ni',  val: chem.ni },
        { key: 'mo',  val: chem.mo },
        { key: 'mn',  val: chem.mn },
        { key: 'si',  val: chem.si },
        { key: 's',   val: chem.s  },
        { key: 'p',   val: chem.p  },
        { key: 'cu',  val: chem.cu },
        { key: 'fe',  val: chem.fe },
        { key: 'co',  val: chem.co }
      ];

      let hasError = false;
      const chemicalErrors = {};

      fieldChecks.forEach(f => {
        if (f.val == null || f.val === '') return;

        const num = parseFloat(f.val);
        if (isNaN(num)) {
          chemicalErrors[f.key.toUpperCase()] = `Invalid number: ${f.val}`;
          hasError = true;
          return;
        }

        const minRaw = gradeInfo[`${f.key}_min`];
        const maxRaw = gradeInfo[`${f.key}_max`];

        const minVal = minRaw !== null ? parseFloat(minRaw) : null;
        const maxVal = maxRaw !== null ? parseFloat(maxRaw) : null;

        if (minVal !== null && maxVal !== null && (num < minVal || num > maxVal)) {
          chemicalErrors[f.key.toUpperCase()] = `${num} is outside allowed range (${minRaw} – ${maxRaw})`;
          hasError = true;
        }
      });

      if (hasError) {
        validationResults.push({
          row: rowNum,
          status: 'error',
          chemicalErrors,
          message: 'Some chemical values out of range'
        });
      } else {
        validationResults.push({
          row: rowNum,
          status: 'success'
        });

        validRecords.push([
          tc_no,
          heat_no,
          size,
          chem.c  ? parseFloat(chem.c)  : null,
          chem.cr ? parseFloat(chem.cr) : null,
          chem.ni ? parseFloat(chem.ni) : null,
          chem.mo ? parseFloat(chem.mo) : null,
          chem.mn ? parseFloat(chem.mn) : null,
          chem.si ? parseFloat(chem.si) : null,
          chem.s  ? parseFloat(chem.s)  : null,
          chem.p  ? parseFloat(chem.p)  : null,
          chem.cu ? parseFloat(chem.cu) : null,
          chem.fe ? parseFloat(chem.fe) : null,
          chem.co ? parseFloat(chem.co) : null,
          gradeInfo.material_grade   // ← store name
        ]);
      }
    });

    let insertedCount = 0;
    if (validRecords.length > 0) {
      const [result] = await db.query(
        `INSERT INTO records 
         (tc_no, heat_no, size, c, cr, ni, mo, mn, si, s, p, cu, fe, co, material_grade)
         VALUES ?`,
        [validRecords]
      );
      insertedCount = result.affectedRows;
    }

    const allValid = validationResults.every(r => r.status === 'success');

    res.json({
      success: true,
      insertedCount,
      validationResults,
      allValid,
      totalRows: dataRows.length,
      validCount: validationResults.filter(r => r.status === 'success').length,
      invalidCount: validationResults.filter(r => r.status === 'error').length,
      message: insertedCount > 0
        ? `Imported ${insertedCount} records successfully`
        : allValid
          ? 'No rows to import (empty data?)'
          : 'Validation passed but no records were valid for insertion'
    });

  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk upload',
      error: err.message
    });
  }
};



