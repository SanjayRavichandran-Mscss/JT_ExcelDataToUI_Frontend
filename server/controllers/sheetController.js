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
                item.p
            ]);

            await connection.query(
                `INSERT INTO certificate_records (
                    certificate_id, po_lineitem_no, item_size, raw_material_size,
                    tc_no, traceability_no, qty_pcs, material_grade,
                    c, cr, ni, mo, mn, si, s, p
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
                         p                 = ?
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
                        c, cr, ni, mo, mn, si, s, p
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                        item.p || null
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