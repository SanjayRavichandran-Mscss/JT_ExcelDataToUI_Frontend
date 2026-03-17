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
      tc_no,
      traceability_no,        // ← NEW
      heat_no,
      size,
      c, cr, ni, mo, mn, si, s, p,
      cu, fe, co,
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
        tc_no, traceability_no, heat_no, size,
        c, cr, ni, mo, mn, si, s, p,
        cu, fe, co,
        material_grade
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tc_no.trim(),
        traceability_no?.trim() || null,
        heat_no.trim(),
        size.trim(),
        c || null, cr || null, ni || null, mo || null, mn || null,
        si || null, s || null, p || null,
        cu || null, fe || null, co || null,
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
    res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
  }
};


// Check if traceability_no is already used (excluding the current record when editing)
exports.checkTraceabilityUnique = async (req, res) => {
  try {
    const { traceability_no, exclude_id } = req.query;

    if (!traceability_no || traceability_no.trim() === '') {
      return res.json({
        success: true,
        isUnique: true,
        message: "Empty traceability number is considered unique"
      });
    }

    let query = `
      SELECT COUNT(*) as count 
      FROM records 
      WHERE traceability_no = ?
    `;
    let params = [traceability_no.trim()];

    // When editing → exclude the current record
    if (exclude_id && !isNaN(Number(exclude_id))) {
      query += ` AND id != ?`;
      params.push(Number(exclude_id));
    }

    const [rows] = await db.query(query, params);

    const count = rows[0]?.count || 0;

    res.json({
      success: true,
      isUnique: count === 0,
      message: count === 0 ? "Available" : "Already in use"
    });
  } catch (err) {
    console.error("Error checking traceability uniqueness:", err);

    res.status(500).json({
      success: false,
      message: "Failed to check traceability number uniqueness",
      error: err.message
    });
  }
};







// Check uniqueness for multiple traceability numbers at once (for bulk)
exports.checkTraceabilityNosUnique = async (req, res) => {
  try {
    const { traceability_nos } = req.body;

    if (!Array.isArray(traceability_nos) || traceability_nos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "traceability_nos must be a non-empty array"
      });
    }

    // Remove empty / whitespace-only values
    const cleanedNos = [...new Set(
      traceability_nos
        .map(n => String(n || '').trim())
        .filter(n => n.length > 0)
    )];

    if (cleanedNos.length === 0) {
      return res.json({
        success: true,
        duplicates: [],
        message: "No valid traceability numbers to check"
      });
    }

    const placeholders = cleanedNos.map(() => '?').join(',');
    const [rows] = await db.query(
      `SELECT traceability_no 
       FROM records 
       WHERE traceability_no IN (${placeholders})`,
      cleanedNos
    );

    const existing = new Set(rows.map(r => r.traceability_no));

    const duplicates = cleanedNos.filter(n => existing.has(n));

    res.json({
      success: true,
      duplicates,           // array of values that already exist
      uniqueCount: cleanedNos.length - duplicates.length,
      duplicateCount: duplicates.length
    });

  } catch (err) {
    console.error("Bulk traceability check error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to check traceability uniqueness",
      error: err.message
    });
  }
};

exports.createMultipleRecords = async (req, res) => {
  try {
    const records = req.body; // array of objects

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of records'
      });
    }

    const values = records.map(r => [
      r.tc_no?.trim() || '',
      r.traceability_no?.trim() || null,      // ← NEW
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
      r.cu || null,
      r.fe || null,
      r.co || null,
      r.material_grade?.trim() || ''
    ]);

    const [result] = await db.query(
      `INSERT INTO records (
        tc_no, traceability_no, heat_no, size,
        c, cr, ni, mo, mn, si, s, p,
        cu, fe, co,
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
    res.status(500).json({ success: false, message: 'Failed to create records', error: error.message });
  }
};

// -------------------------------
// GET ALL RECORDS
// -------------------------------
exports.getAllRecords = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, tc_no, traceability_no, heat_no, size,
        c, cr, ni, mo, mn, si, s, p,
        cu, fe, co,
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
    res.status(500).json({ success: false, message: 'Failed to fetch records', error: error.message });
  }
};

// -------------------------------
// UPDATE RECORD
// -------------------------------
exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const {
    tc_no,
    traceability_no,          // ← NEW
    heat_no,
    size,
    c, cr, ni, mo, mn, si, s, p,
    cu, fe, co,
    material_grade
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE records SET
        tc_no = ?, traceability_no = ?, heat_no = ?, size = ?,
        c = ?, cr = ?, ni = ?, mo = ?, mn = ?, si = ?, s = ?, p = ?,
        cu = ?, fe = ?, co = ?,
        material_grade = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        tc_no?.trim() || '',
        traceability_no?.trim() || null,
        heat_no?.trim() || '',
        size?.trim() || '',
        c || null, cr || null, ni || null, mo || null, mn || null,
        si || null, s || null, p || null,
        cu || null, fe || null, co || null,
        material_grade?.trim() || '',
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.status(200).json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error('Update record error:', error);
    res.status(500).json({ success: false, message: 'Failed to update record', error: error.message });
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










// Helper: Parse size string into numeric value + unit type
function parseSize(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return { value: null, unit: null };

  const cleaned = sizeStr.trim().toLowerCase().replace(/\s+/g, '');

  // 1. Fractional inch: 1/4", 3/8", 1/2"
  let fracMatch = cleaned.match(/^(\d+)\/(\d+)"?(od)?$/i);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    return { value: num / den, unit: 'inch' };
  }

  // 2. Decimal inch: 1", 0.75"
  let decInch = cleaned.match(/^(\d+(?:\.\d+)?)"?(od)?$/i);
  if (decInch) {
    return { value: parseFloat(decInch[1]), unit: 'inch' };
  }

  // 3. mm / MM: 20mm, 25 MM, 6mm
  let mmMatch = cleaned.match(/^(\d+(?:\.\d+)?)(mm)?$/i);
  if (mmMatch) {
    return { value: parseFloat(mmMatch[1]), unit: 'mm' };
  }

  // 4. K rating: 3k, 10K, 20k
  let kMatch = cleaned.match(/^(\d+)k$/i);
  if (kMatch) {
    return { value: parseInt(kMatch[1], 10), unit: 'k' };
  }

  return { value: null, unit: null };
}

exports.getRecordByTcNo = async (req, res) => {
  try {
    const { tc_no } = req.query;

    if (!tc_no || !tc_no.trim()) {
      return res.status(400).json({
        success: false,
        message: 'tc_no is required in query parameters'
      });
    }

    const cleanedTcNo = tc_no.trim();

    // ─── 1. Fetch main record ────────────────────────────────────────
    const [rows] = await db.query(
      `SELECT 
        id, tc_no, heat_no, size, 
        c, cr, ni, mo, mn, si, s, p,
        cu, fe, co,
        material_grade, created_at, updated_at 
      FROM records 
      WHERE tc_no = ? 
      LIMIT 1`,
      [cleanedTcNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No record found with tc_no: ${cleanedTcNo}`
      });
    }

    const record = rows[0];

    // ─── 2. Extract and normalize size value for mathematical comparison ─────
    let normalizedSize = null;
    let originalSize = record.size;

    if (originalSize && typeof originalSize === 'string') {
      // Extract numeric value and unit from various formats
      // Examples: "1/4"", "3/8" OD", "1/2"", "6 MM", "10K", "20", "25 MM"
      const sizeStr = originalSize.trim();
      
      // Handle fraction formats (e.g., 1/4", 3/8")
      if (sizeStr.includes('/')) {
        const fractionMatch = sizeStr.match(/(\d+)\/(\d+)/);
        if (fractionMatch) {
          const numerator = parseFloat(fractionMatch[1]);
          const denominator = parseFloat(fractionMatch[2]);
          if (denominator !== 0) {
            normalizedSize = numerator / denominator;
          }
        }
      } 
      // Handle decimal formats with or without units
      else {
        const decimalMatch = sizeStr.match(/(\d+(?:\.\d+)?)/);
        if (decimalMatch) {
          normalizedSize = parseFloat(decimalMatch[1]);
        }
      }
      
      // Handle special cases like "3K", "6K", "10K", etc.
      const kMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*K/i);
      if (kMatch) {
        normalizedSize = parseFloat(kMatch[1]) * 1000;
      }
    }

    let workingPressure = null;
    let testPressure = null;
    let matchedSize = null;

    // ─── 3. Fetch all pressure records for mathematical comparison ──────────
    if (normalizedSize !== null) {
      try {
        // Get all pressure records
        const [allPressures] = await db.query(
          `SELECT working_pressure, test_pressure, size FROM pressures`
        );

        // Function to normalize pressure size for comparison
        const normalizePressureSize = (pressureSize) => {
          if (!pressureSize || typeof pressureSize !== 'string') return null;
          
          const ps = pressureSize.trim();
          
          // Handle fraction formats in pressure table
          if (ps.includes('/')) {
            const fractionMatch = ps.match(/(\d+)\/(\d+)/);
            if (fractionMatch) {
              const numerator = parseFloat(fractionMatch[1]);
              const denominator = parseFloat(fractionMatch[2]);
              if (denominator !== 0) {
                return numerator / denominator;
              }
            }
          }
          
          // Handle K values (3K, 6K, 10K, 15K, 20K, 30K)
          const kMatch = ps.match(/(\d+(?:\.\d+)?)\s*K/i);
          if (kMatch) {
            return parseFloat(kMatch[1]) * 1000;
          }
          
          // Handle decimal values
          const decimalMatch = ps.match(/(\d+(?:\.\d+)?)/);
          if (decimalMatch) {
            return parseFloat(decimalMatch[1]);
          }
          
          return null;
        };

        // Compare with tolerance for floating point precision
        const tolerance = 0.0001;
        
        for (const pressure of allPressures) {
          const pressureNormValue = normalizePressureSize(pressure.size);
          
          if (pressureNormValue !== null) {
            // Mathematical comparison with tolerance
            if (Math.abs(normalizedSize - pressureNormValue) < tolerance) {
              workingPressure = pressure.working_pressure;
              testPressure = pressure.test_pressure;
              matchedSize = pressure.size;
              break;
            }
            
            // Handle inch to mm conversion if needed
            // Assuming if one is in inches and other in mm, we might need conversion
            // Check if the original size has inch symbol and pressure size has MM or vice versa
            if (originalSize.includes('"') && pressure.size.toUpperCase().includes('MM')) {
              // Convert inches to mm (1 inch = 25.4 mm)
              const inchToMm = normalizedSize * 25.4;
              if (Math.abs(inchToMm - pressureNormValue) < tolerance) {
                workingPressure = pressure.working_pressure;
                testPressure = pressure.test_pressure;
                matchedSize = pressure.size;
                break;
              }
            } else if (originalSize.toUpperCase().includes('MM') && pressure.size.includes('"')) {
              // Convert mm to inches
              const mmToInch = normalizedSize / 25.4;
              if (Math.abs(mmToInch - pressureNormValue) < tolerance) {
                workingPressure = pressure.working_pressure;
                testPressure = pressure.test_pressure;
                matchedSize = pressure.size;
                break;
              }
            }
          }
        }
      } catch (pressureError) {
        console.error('Error fetching pressures:', pressureError);
        // Continue with null pressures
      }
    }

    // ─── 4. If no match found with mathematical comparison, try direct string match ──
    if (workingPressure === null && originalSize) {
      try {
        const [directMatch] = await db.query(
          `SELECT working_pressure, test_pressure, size 
           FROM pressures 
           WHERE size = ? 
           LIMIT 1`,
          [originalSize.trim()]
        );
        
        if (directMatch.length > 0) {
          workingPressure = directMatch[0].working_pressure;
          testPressure = directMatch[0].test_pressure;
          matchedSize = directMatch[0].size;
        }
      } catch (directMatchError) {
        console.error('Error in direct match:', directMatchError);
      }
    }

    // ─── 5. Final response with detailed information ───────────────────────────
    res.status(200).json({
      success: true,
      record: {
        ...record,
        normalized_value: normalizedSize,
        matched_pressure_size: matchedSize || null,
        working_pressure: workingPressure,
        test_pressure: testPressure,
        pressure_match_method: matchedSize ? (matchedSize === originalSize ? 'direct_match' : 'mathematical_match') : 'no_match'
      }
    });
  } catch (error) {
    console.error('Error in getRecordByTcNo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch record',
      error: error.message
    });
  }
};



// controllers/certificateController.js  (example)
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
      signature = 0,
      test_line_items = [],     // ← this is now coming from frontend
    } = req.body;

    const validSignature = [0, 1, 2].includes(Number(signature))
      ? Number(signature)
      : 0;

    // 1. Insert header
    const [headerResult] = await connection.query(
      `INSERT INTO certificate_details 
      (cert_no, cert_date, delivery_note_no, delivery_date, customer_name, po_no, po_date, signature, test_line_items)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cert_no,
        cert_date,
        delivery_note_no || null,
        delivery_date || null,
        customer_name || null,
        po_no || null,
        po_date || null,
        validSignature,
        JSON.stringify(test_line_items),   // ← stored as JSON array
      ]
    );

    const certificate_id = headerResult.insertId;

    // 2. Insert items
    if (items.length > 0) {
      const itemValues = items.map((item) => [
        certificate_id,
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
        item.cu || null,
        item.fe || null,
        item.co || null,
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
      message: 'Certificate created successfully',
      certificateId: certificate_id,
      cert_no,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create certificate error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create certificate'
    });
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
        items = [],
        test_line_items = [],   // ← NEW
      } = req.body;

      // 1. Update header (always)
      await connection.query(
        `UPDATE certificate_details 
        SET cert_no          = ?,
            cert_date        = ?,
            delivery_note_no = ?,
            delivery_date    = ?,
            customer_name    = ?,
            po_no            = ?,
            po_date          = ?,
            signature        = ?,
            test_line_items  = ?,
            updated_at       = NOW()
        WHERE id = ?`,
        [
          cert_no,
          cert_date,
          delivery_note_no,
          delivery_date,
          customer_name,
          po_no,
          po_date,
          signature,
          JSON.stringify(test_line_items),
          id,
        ]
      );

      // 2. Get current items from DB
      const [existingItems] = await connection.query(
        `SELECT id FROM certificate_records WHERE certificate_id = ?`,
        [id]
      );

      const existingIds = new Set(existingItems.map((row) => row.id));

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
              item.cu || null,
              item.fe || null,
              item.co || null,
              item.id,
              id,
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
              item.cu || null,
              item.fe || null,
              item.co || null,
            ]
          );
        }
      }

      // 4. Delete removed items
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
      res.status(200).json({ success: true, message: 'Certificate updated successfully' });
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
        SELECT 
          h.*,
          COUNT(r.id) as item_count,
          JSON_LENGTH(h.test_line_items) as test_messages_count
        FROM certificate_details h 
        LEFT JOIN certificate_records r ON h.id = r.certificate_id 
        GROUP BY h.id 
        ORDER BY h.created_at DESC
      `);

      res.status(200).json({
        success: true,
        certificates: rows,
      });
    } catch (error) {
      console.error('Get all certificates error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };

exports.getCertificateById = async (req, res) => {
  try {
    const [headers] = await db.query(
      `SELECT * FROM certificate_details WHERE id = ?`,
      [req.params.id]
    );

    if (headers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found',
      });
    }

    const header = headers[0];

    // Handle test_line_items — it can come as:
    // 1. Already parsed array/object (mysql2 auto-parsing)
    // 2. Raw JSON string (older mysql2 or different config)
    let testItems = [];

    if (header.test_line_items) {
      if (Array.isArray(header.test_line_items)) {
        // Already an array → use directly
        testItems = header.test_line_items;
      } else if (typeof header.test_line_items === 'object') {
        // It's an object (rare, but possible) → convert to array
        testItems = [JSON.stringify(header.test_line_items)];
      } else if (typeof header.test_line_items === 'string') {
        // Raw string → try to parse
        try {
          const parsed = JSON.parse(header.test_line_items.trim());
          testItems = Array.isArray(parsed) ? parsed : [parsed];
        } catch (parseErr) {
          console.error('JSON parse failed on string:', parseErr);
          // Fallback: treat the whole string as one message
          testItems = [header.test_line_items.trim()];
        }
      }
    }

    // Clean up: remove empty/invalid entries
    testItems = testItems.filter(
      msg => typeof msg === 'string' && msg.trim().length > 0
    );

    // Assign cleaned array
    header.test_line_items = testItems;

    // Fetch items
    const [items] = await db.query(
      'SELECT * FROM certificate_records WHERE certificate_id = ?',
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...header,
        items,
      },
    });
  } catch (error) {
    console.error('Get certificate by id error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


  exports.deleteCertificate = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Delete child records first
      await connection.query('DELETE FROM certificate_records WHERE certificate_id = ?', [id]);

      // Delete header
      const [result] = await connection.query('DELETE FROM certificate_details WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Certificate not found',
        });
      }

      await connection.commit();

      res.status(200).json({
        success: true,
        message: 'Certificate deleted successfully',
      });
    } catch (error) {
      await connection.rollback();
      console.error('Delete certificate error:', error);
      res.status(500).json({ success: false, error: error.message });
    } finally {
      connection.release();
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
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('records')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false
    });

    if (rawRows.length < 2) {
      return res.status(400).json({ success: false, message: 'Excel file is empty or has no data rows' });
    }

    // ─── Robust header detection with column mapping ────────────────────────────────
    let headerRowIndex = -1;
    let columnMap = {};

    for (let i = 0; i < Math.min(12, rawRows.length); i++) {
      const row = rawRows[i].map(v => String(v || '').trim().toLowerCase().replace(/\s+/g, ' '));

      const tempMap = {};
      row.forEach((cell, idx) => {
        if (cell.includes('tc_no')) tempMap.tc_no = idx;
        if (cell.includes('traceability_no')) tempMap.traceability_no = idx;
        if (cell.includes('heat_no')) tempMap.heat_no = idx;
        if (cell.includes('size')) tempMap.size = idx;
        if (cell.includes('material_grade_id')) tempMap.material_grade_id = idx;
      });

      // Require at least tc_no + heat_no + size (or material_grade_id)
      const hasTcOrHeat = tempMap.tc_no !== undefined || tempMap.heat_no !== undefined;
      const hasSizeOrGrade = tempMap.size !== undefined || tempMap.material_grade_id !== undefined;

      if (hasTcOrHeat && hasSizeOrGrade && Object.keys(tempMap).length >= 3) {
        headerRowIndex = i;
        columnMap = tempMap;
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.log('Header detection failed. First few rows:', rawRows.slice(0, 5));
      return res.status(400).json({
        success: false,
        message: 'Could not find header row. Expected columns: tc_no, heat_no, size, material_grade_id'
      });
    }

    const dataRows = rawRows.slice(headerRowIndex + 1)
      .filter(row => row && row.some(cell => cell !== '' && cell != null));

    if (dataRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No data rows found after header' });
    }

    // ─── Fetch all material grades and their limits ────────────────────────────────
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

    const validationResults = [];

    // ─── Validate each data row using columnMap ────────────────────────────────────
    dataRows.forEach((row, idx) => {
      const rowNum = headerRowIndex + idx + 2;

      // Read values safely using columnMap
      const material_grade_id_raw = columnMap.material_grade_id !== undefined ? row[columnMap.material_grade_id] : null;
      const tc_no               = columnMap.tc_no !== undefined ? String(row[columnMap.tc_no] || '').trim() : '';
      const traceability_no     = columnMap.traceability_no !== undefined ? String(row[columnMap.traceability_no] || '').trim() : '';
      const heat_no             = columnMap.heat_no !== undefined ? String(row[columnMap.heat_no] || '').trim() : '';
      const size                = columnMap.size !== undefined ? String(row[columnMap.size] || '').trim() : '';

      // Chemical components (assuming they come in order after size)
      // You can also make this dynamic if needed
      const chemStart = Math.max(
        columnMap.size ?? -1,
        columnMap.heat_no ?? -1,
        columnMap.tc_no ?? -1,
        columnMap.traceability_no ?? -1
      ) + 1;

      const chem = {
        c:  row[chemStart]     || '',
        cr: row[chemStart + 1] || '',
        ni: row[chemStart + 2] || '',
        mo: row[chemStart + 3] || '',
        mn: row[chemStart + 4] || '',
        si: row[chemStart + 5] || '',
        s:  row[chemStart + 6] || '',
        p:  row[chemStart + 7] || '',
        cu: row[chemStart + 8] || '',
        fe: row[chemStart + 9] || '',
        co: row[chemStart + 10]|| ''
      };

      let material_grade_id = null;
      if (material_grade_id_raw !== '' && !isNaN(Number(material_grade_id_raw))) {
        material_grade_id = Number(material_grade_id_raw);
      }

      const errors = [];

      // Required fields
      if (!tc_no)             errors.push("TC No is required");
      if (!heat_no)           errors.push("Heat No is required");
      if (!size)              errors.push("Size is required");
      if (material_grade_id === null) errors.push("Valid numeric material_grade_id is required");

      if (errors.length > 0) {
        validationResults.push({
          row: rowNum,
          message: errors.join(' | '),
          rowData: { tc_no, traceability_no, heat_no, size, ...chem }
        });
        return;
      }

      const gradeInfo = gradeMap[material_grade_id];

      if (!gradeInfo) {
        validationResults.push({
          row: rowNum,
          message: `Material grade ID ${material_grade_id} not found in database`,
          rowData: { tc_no, traceability_no, heat_no, size, ...chem }
        });
        return;
      }

      // Chemical composition validation
      const chemErrors = [];

      const checks = [
        { key: 'c',  val: chem.c,  name: 'C'  },
        { key: 'cr', val: chem.cr, name: 'Cr' },
        { key: 'ni', val: chem.ni, name: 'Ni' },
        { key: 'mo', val: chem.mo, name: 'Mo' },
        { key: 'mn', val: chem.mn, name: 'Mn' },
        { key: 'si', val: chem.si, name: 'Si' },
        { key: 's',  val: chem.s,  name: 'S'  },
        { key: 'p',  val: chem.p,  name: 'P'  },
        { key: 'cu', val: chem.cu, name: 'Cu' },
        { key: 'fe', val: chem.fe, name: 'Fe' },
        { key: 'co', val: chem.co, name: 'Co' }
      ];

      checks.forEach(({ key, val, name }) => {
        if (val === '' || val == null) return;

        const num = parseFloat(val);
        if (isNaN(num)) {
          chemErrors.push(`${name}: invalid number (${val})`);
          return;
        }

        const min = gradeInfo[`${key}_min`];
        const max = gradeInfo[`${key}_max`];

        if (min != null && max != null && (num < min || num > max)) {
          chemErrors.push(`${name}: ${num} is outside allowed range (${min} – ${max})`);
        }
      });

      if (chemErrors.length > 0) {
        validationResults.push({
          row: rowNum,
          message: chemErrors.join(' | '),
          rowData: { tc_no, traceability_no, heat_no, size, ...chem }
        });
      } else {
        validationResults.push({
          row: rowNum,
          message: null,
          rowData: { tc_no, traceability_no, heat_no, size, ...chem, material_grade: gradeInfo.material_grade }
        });
      }
    });

    const invalidRows = validationResults.filter(r => r.message);
    const allValid = invalidRows.length === 0;

    res.json({
      success: true,
      validationResults,
      totalRows: dataRows.length,
      validCount: dataRows.length - invalidRows.length,
      invalidCount: invalidRows.length,
      allRowsValid: allValid,
      message: allValid
        ? 'All rows passed validation — ready to import'
        : 'Some rows have validation issues — please correct them'
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
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('records')) || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', blankrows: false });

    let headerRowIndex = 0;
    while (headerRowIndex < rawRows.length) {
      const row = rawRows[headerRowIndex].map(v => String(v || '').trim().toLowerCase());
      if (row.includes('tc_no') || row.includes('heat_no')) break;
      headerRowIndex++;
    }

    if (headerRowIndex >= rawRows.length - 1) {
      return res.status(400).json({ success: false, message: 'Header row not found' });
    }

    const dataRows = rawRows.slice(headerRowIndex + 1).filter(r => r.some(c => c !== ''));

    // Fetch grades
    const [grades] = await db.query(`
      SELECT m.id AS material_grade_id, m.material_grade,
             l.c_min, l.c_max, l.cr_min, l.cr_max, l.ni_min, l.ni_max, l.mo_min, l.mo_max,
             l.mn_min, l.mn_max, l.si_min, l.si_max, l.s_min, l.s_max, l.p_min, l.p_max,
             l.cu_min, l.cu_max, l.fe_min, l.fe_max, l.co_min, l.co_max
      FROM material_grade_master m
      LEFT JOIN records_min_max_values l ON m.id = l.material_grade_id
    `);

    const gradeMap = {};
    grades.forEach(g => { if (g.material_grade_id) gradeMap[g.material_grade_id] = g; });

    const validRecords = [];
    const validationResults = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = headerRowIndex + i + 2;

      const material_grade_id = Number(row[1]) || null;
      const tc_no            = String(row[2] || '').trim();
      const traceability_no  = String(row[3] || '').trim(); // optional
      const heat_no          = String(row[4] || '').trim();
      const size             = String(row[5] || '').trim();

      const chem = {
        c: row[6], cr: row[7], ni: row[8], mo: row[9],
        mn: row[10], si: row[11], s: row[12], p: row[13],
        cu: row[14], fe: row[15], co: row[16]
      };

      const errors = [];

      if (!tc_no)             errors.push("TC No required");
      if (!heat_no)           errors.push("Heat No required");
      if (!size)              errors.push("Size required");
      if (!material_grade_id || isNaN(material_grade_id)) errors.push("Valid numeric material_grade_id required");

      if (errors.length > 0) {
        validationResults.push({ row: rowNum, message: errors.join(' | ') });
        continue;
      }

      const grade = gradeMap[material_grade_id];
      if (!grade) {
        validationResults.push({ row: rowNum, message: `Grade ID ${material_grade_id} not found` });
        continue;
      }

      let chemValid = true;
      const chemErrors = [];

      [
        {k:'c', v:chem.c},  {k:'cr',v:chem.cr}, {k:'ni',v:chem.ni}, {k:'mo',v:chem.mo},
        {k:'mn',v:chem.mn}, {k:'si',v:chem.si}, {k:'s', v:chem.s},  {k:'p', v:chem.p},
        {k:'cu',v:chem.cu}, {k:'fe',v:chem.fe}, {k:'co',v:chem.co}
      ].forEach(({k, v}) => {
        if (v === '' || v == null) return;
        const num = parseFloat(v);
        if (isNaN(num)) {
          chemErrors.push(`${k.toUpperCase()}: invalid number`);
          chemValid = false;
          return;
        }
        const min = grade[`${k}_min`];
        const max = grade[`${k}_max`];
        if (min != null && max != null && (num < min || num > max)) {
          chemErrors.push(`${k.toUpperCase()}: ${num} out of range (${min}-${max})`);
          chemValid = false;
        }
      });

      if (!chemValid) {
        validationResults.push({ row: rowNum, message: chemErrors.join(' | ') });
        continue;
      }

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
        grade.material_grade,
        traceability_no || null
      ]);

      validationResults.push({ row: rowNum, message: null });
    }

    let inserted = 0;
    if (validRecords.length > 0) {
      await db.query(
        `INSERT INTO records 
         (tc_no, heat_no, size, c, cr, ni, mo, mn, si, s, p, cu, fe, co, material_grade, traceability_no)
         VALUES ?`,
        [validRecords]
      );
      inserted = validRecords.length;
    }

    res.json({
      success: true,
      insertedCount: inserted,
      validationResults,
      totalRows: dataRows.length,
      validCount: validRecords.length,
      invalidCount: dataRows.length - validRecords.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Bulk upload failed', error: err.message });
  }
};































exports.getNextCertNumber = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();                    // 2026 (full year)
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0'); // 03

    // Pattern to match current month/year certificates
    const likePattern = `%TC/${currentMonth}/${currentYear}`;

    // Get the most recent (highest number) certificate for this month/year
    const [rows] = await db.query(
      `
        SELECT cert_no
        FROM certificate_details
        WHERE cert_no LIKE ?
        ORDER BY 
          CAST(SUBSTRING_INDEX(cert_no, 'TC/', 1) AS UNSIGNED) DESC
        LIMIT 1
      `,
      [likePattern]
    );

    let nextNumber = 300;

    if (rows.length > 0 && rows[0].cert_no) {
      const lastCertNo = rows[0].cert_no.trim();

      // Expected format:   305TC/03/2026
      // Extract the numeric part before "TC/"
      const match = lastCertNo.match(/^(\d+)TC\/\d{2}\/\d{4}$/);

      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber + 1;
      } else {
        // If format is wrong → still start from 300 (or log warning)
        console.warn(`Unexpected cert_no format: ${lastCertNo} — starting from 300`);
      }
    }

    const nextCertNo = `${nextNumber}TC/${currentMonth}/${currentYear}`;

    return res.json({
      success: true,
      nextCertNo,
      currentMonth,
      currentYear,
      startingFrom: rows.length === 0 ? "new month/year - starting at 300" : "incremented from previous",
    });
  } catch (err) {
    console.error("Error in getNextCertNumber:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate next certificate number",
      error: err.message,
    });
  }
};



















exports.getRecordsByTraceabilityNos = async (req, res) => {
  try {
    let traceabilityNos = req.query.traceability_nos;

    // Handle different input formats
    if (!traceabilityNos) {
      return res.status(400).json({
        success: false,
        message: 'traceability_nos parameter is required'
      });
    }

    // Normalize to array
    if (typeof traceabilityNos === 'string') {
      traceabilityNos = traceabilityNos.split(',').map(t => t.trim()).filter(Boolean);
    } else if (Array.isArray(traceabilityNos)) {
      traceabilityNos = traceabilityNos.map(t => String(t).trim()).filter(Boolean);
    } else {
      traceabilityNos = [];
    }

    if (traceabilityNos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid traceability numbers provided'
      });
    }

    // Prepare placeholders
    const placeholders = traceabilityNos.map(() => '?').join(', ');

    const query = `
      SELECT 
        id, 
        tc_no, 
        traceability_no, 
        heat_no, 
        size,
        c, cr, ni, mo, mn, si, s, p,
        cu, fe, co,
        material_grade,
        created_at, 
        updated_at
      FROM records 
      WHERE traceability_no IN (${placeholders})
      ORDER BY FIELD(traceability_no, ${placeholders})
    `;

    const [rows] = await db.query(query, [...traceabilityNos, ...traceabilityNos]);

    res.status(200).json({
      success: true,
      count: rows.length,
      requested: traceabilityNos,
      records: rows,
      message: rows.length === 0 
        ? `No matching records found for ${traceabilityNos.length} traceability number(s)`
        : undefined
    });

  } catch (error) {
    console.error('Error in getRecordsByTraceabilityNos:', error);

    // More developer-friendly error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch records by traceability numbers',
      error: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage || null,
      sql: error.sql || null
    });
  }
};


























// Add this new function to sheetController.js
exports.getPressuresBySizes = async (req, res) => {
  try {
    const { sizes } = req.body;

    if (!Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'sizes array is required'
      });
    }

    // Clean and deduplicate sizes
    const uniqueSizes = [...new Set(sizes.filter(s => s && typeof s === 'string' && s.trim()))];
    
    if (uniqueSizes.length === 0) {
      return res.json({
        success: true,
        pressures: {}
      });
    }

    // Fetch all pressures from database
    const [allPressures] = await db.query(
      `SELECT size, working_pressure, test_pressure FROM pressures`
    );

    // Function to extract size value with priority
    const extractSizeValue = (sizeStr) => {
      if (!sizeStr || typeof sizeStr !== 'string') return null;
      
      const cleaned = sizeStr.trim();
      
      // Priority 1: Extract K value (e.g., 3K, 6K, 10K, 15K, 20K, 30K)
      const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*K/i);
      if (kMatch) {
        return {
          value: parseInt(kMatch[1], 10),
          type: 'K',
          original: cleaned
        };
      }
      
      // Priority 2: Extract OD/Inch value
      // Pattern for fractions like 1/4", 3/8", 1/2"
      const fractionMatch = cleaned.match(/(\d+)\/(\d+)(?:\s*"?\s*OD)?/i);
      if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);
        return {
          value: numerator / denominator,
          type: 'OD',
          original: cleaned,
          unit: 'inch'
        };
      }
      
      // Pattern for decimal inches like 1", 0.75"
      const decimalInchMatch = cleaned.match(/(\d+(?:\.\d+)?)(?:\s*"?\s*OD)?/i);
      if (decimalInchMatch) {
        return {
          value: parseFloat(decimalInchMatch[1]),
          type: 'OD',
          original: cleaned,
          unit: 'inch'
        };
      }
      
      // Priority 3: Extract MM value
      const mmMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*MM/i);
      if (mmMatch) {
        return {
          value: parseFloat(mmMatch[1]),
          type: 'MM',
          original: cleaned,
          unit: 'mm'
        };
      }
      
      return null;
    };

    // Function to normalize pressure size for comparison
    const normalizePressureSize = (pressureSize) => {
      if (!pressureSize || typeof pressureSize !== 'string') return null;
      
      const ps = pressureSize.trim();
      
      // Handle K values in pressure table
      const kMatch = ps.match(/(\d+(?:\.\d+)?)\s*K/i);
      if (kMatch) {
        return {
          value: parseInt(kMatch[1], 10),
          type: 'K',
          original: ps
        };
      }
      
      // Handle fraction formats in pressure table
      const fractionMatch = ps.match(/(\d+)\/(\d+)(?:\s*OD)?/i);
      if (fractionMatch) {
        const numerator = parseInt(fractionMatch[1], 10);
        const denominator = parseInt(fractionMatch[2], 10);
        return {
          value: numerator / denominator,
          type: 'OD',
          original: ps,
          unit: 'inch'
        };
      }
      
      // Handle decimal formats
      const decimalMatch = ps.match(/(\d+(?:\.\d+)?)(?:\s*OD)?/i);
      if (decimalMatch) {
        // Check if it's likely an OD value
        if (ps.includes('OD') || ps.includes('"')) {
          return {
            value: parseFloat(decimalMatch[1]),
            type: 'OD',
            original: ps,
            unit: 'inch'
          };
        }
      }
      
      // Handle MM values
      const mmMatch = ps.match(/(\d+(?:\.\d+)?)\s*MM/i);
      if (mmMatch) {
        return {
          value: parseFloat(mmMatch[1]),
          type: 'MM',
          original: ps,
          unit: 'mm'
        };
      }
      
      return null;
    };

    // Process each size and find matching pressure
    const pressureMap = {};
    const tolerance = 0.001; // For floating point comparison

    for (const size of uniqueSizes) {
      const extracted = extractSizeValue(size);
      if (!extracted) continue;

      let bestMatch = null;
      let bestMatchPriority = 999;

      for (const pressure of allPressures) {
        const normalized = normalizePressureSize(pressure.size);
        if (!normalized) continue;

        // Check if types match (K, OD, MM)
        if (extracted.type === normalized.type) {
          // Direct type match - highest priority
          if (extracted.type === 'K') {
            // K values should match exactly
            if (extracted.value === normalized.value) {
              const priority = 1; // K has highest priority
              if (priority < bestMatchPriority) {
                bestMatch = pressure;
                bestMatchPriority = priority;
                break; // K match found, no need to continue
              }
            }
          } else if (extracted.type === 'OD') {
            // Compare inch values
            if (Math.abs(extracted.value - normalized.value) < tolerance) {
              const priority = 2; // OD has second priority
              if (priority < bestMatchPriority) {
                bestMatch = pressure;
                bestMatchPriority = priority;
              }
            }
          } else if (extracted.type === 'MM') {
            // Compare mm values directly
            if (Math.abs(extracted.value - normalized.value) < tolerance) {
              const priority = 3; // MM has lowest priority
              if (priority < bestMatchPriority) {
                bestMatch = pressure;
                bestMatchPriority = priority;
              }
            }
          }
        } else {
          // Cross-unit comparison (e.g., inch to mm)
          // This is a fallback if no direct type match found
          if (extracted.type === 'OD' && normalized.type === 'MM') {
            // Convert extracted inch to mm
            const inchToMm = extracted.value * 25.4;
            if (Math.abs(inchToMm - normalized.value) < tolerance) {
              const priority = 4; // Cross-unit has lowest priority
              if (priority < bestMatchPriority) {
                bestMatch = pressure;
                bestMatchPriority = priority;
              }
            }
          } else if (extracted.type === 'MM' && normalized.type === 'OD') {
            // Convert extracted mm to inch
            const mmToInch = extracted.value / 25.4;
            if (Math.abs(mmToInch - normalized.value) < tolerance) {
              const priority = 4;
              if (priority < bestMatchPriority) {
                bestMatch = pressure;
                bestMatchPriority = priority;
              }
            }
          }
        }
      }

      if (bestMatch) {
        pressureMap[size] = {
          size: bestMatch.size,
          working_pressure: bestMatch.working_pressure,
          test_pressure: bestMatch.test_pressure
        };
      }
    }

    res.json({
      success: true,
      pressures: pressureMap
    });

  } catch (error) {
    console.error('Error in getPressuresBySizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pressures by sizes',
      error: error.message
    });
  }
};