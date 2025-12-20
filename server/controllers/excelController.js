const XLSX = require('xlsx');
const fs = require('fs');
const { db } = require('../config/db'); // Directly import the pool as "db"

exports.uploadExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    fs.unlinkSync(req.file.path); // Clean up

    if (data.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    res.json({ data });
  } catch (err) {
    if (req.file && req.file.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to parse Excel', details: err.message });
  }
};

exports.storeData = async (req, res) => {
  const { data } = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: 'Invalid or empty data' });
  }

  try {
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow);
    const tableName = 'excel_data';

    // Create table if not exists (dynamic columns)
    const createColumns = columns.map(col => `\`${col}\` TEXT`).join(', ');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ${createColumns}
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(createTableQuery);

    // Prepare bulk INSERT
    const placeholders = columns.map(() => '?').join(', ');
    const insertQuery = `
      INSERT INTO ${tableName} (${columns.map(c => `\`${c}\``).join(', ')})
      VALUES ?
    `;

    const values = data.map(row => columns.map(col => row[col] ?? null));

    const [result] = await db.query(insertQuery, [values]);

    res.json({ 
      message: 'Data stored successfully', 
      rowsInserted: result.affectedRows 
    });
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: 'Failed to store data', details: err.message });
  }
};