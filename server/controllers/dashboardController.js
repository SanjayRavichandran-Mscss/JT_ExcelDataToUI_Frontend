const { db } = require('../config/db');

exports.testDashboard = async (req, res) => {
  try {
    // Optional: you can test DB connection here
    const [rows] = await db.query('SELECT 1 AS test');
    
    res.status(200).json({
      success: true,
      message: "Dashboard test route running successfully",
      databaseStatus: "connected",
      user: req.user
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


exports.getDashboardData = async (req, res) => {
  try {
    // 1. Get total customers count from certificate_details table
    const [totalCustomers] = await db.query(
      'SELECT COUNT(*) as total_customers_count FROM certificate_details'
    );

    // 2. Get overall PO line items count (total rows in certificate_records)
    const [overallPOLineItems] = await db.query(
      'SELECT COUNT(*) as total_po_lineitems_count FROM certificate_records'
    );

    // 3. Get records table statistics
    const [recordsStats] = await db.query(
      `SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT tc_no) as unique_tc_no_count,
        COUNT(tc_no) as total_tc_no_count
       FROM records`
    );

    // 4. Get unique tc_no with occurrence count
    const [uniqueTcNoWithCount] = await db.query(
      `SELECT 
        tc_no,
        COUNT(*) as occurrence_count
       FROM records 
       GROUP BY tc_no 
       ORDER BY occurrence_count DESC`
    );

    // 5. Get customers list with their PO line items count (only essential info)
    const [customersList] = await db.query(
      `SELECT 
        cd.id,
        cd.customer_name,
        COUNT(cr.certificate_id) as total_po_line_items
       FROM certificate_details cd
       LEFT JOIN certificate_records cr ON cd.id = cr.certificate_id
       GROUP BY cd.id, cd.customer_name
       ORDER BY cd.customer_name`
    );

    // 6. Get certificate_id related data (line items per certificate)
    const [certificateLineItems] = await db.query(
      `SELECT 
        cr.certificate_id,
        cd.customer_name,
        COUNT(*) as line_items_count
       FROM certificate_records cr
       LEFT JOIN certificate_details cd ON cr.certificate_id = cd.id
       GROUP BY cr.certificate_id, cd.customer_name
       ORDER BY line_items_count DESC`
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total_customers: totalCustomers[0]?.total_customers_count || 0,
          total_po_line_items: overallPOLineItems[0]?.total_po_lineitems_count || 0,
          total_records: recordsStats[0]?.total_records || 0,
          unique_tc_numbers: recordsStats[0]?.unique_tc_no_count || 0
        },
        customers: customersList,
        tc_numbers: uniqueTcNoWithCount,
        certificate_analysis: certificateLineItems
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
};