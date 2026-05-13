const { db } = require('../config/db');

// Helper function to update completed count for a specific date
const updateCompletedCountForDate = async (date) => {
    try {
        // Get actual completed count from certificate_details table
        const [completedResult] = await db.query(
            `SELECT COUNT(*) as completed_count 
             FROM certificate_details 
             WHERE DATE(created_at) = ?`,
            [date]
        );
        
        const actualCompleted = completedResult[0]?.completed_count || 0;
        
        // Update the progress table
        await db.query(
            `UPDATE progress 
             SET completed_count = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE selected_date = ?`,
            [actualCompleted, date]
        );
        
        return actualCompleted;
    } catch (error) {
        console.error('Error updating completed count:', error);
        return 0;
    }
};

// Helper function to update all progress entries
const updateAllProgressEntries = async () => {
    try {
        // Get all dates from progress table
        const [progressEntries] = await db.query(
            'SELECT selected_date FROM progress'
        );
        
        for (const entry of progressEntries) {
            const dateStr = entry.selected_date.toISOString().split('T')[0];
            await updateCompletedCountForDate(dateStr);
        }
        console.log(`Updated ${progressEntries.length} progress entries`);
    } catch (error) {
        console.error('Error updating all progress entries:', error);
    }
};

exports.testDashboard = async (req, res) => {
    try {
        // Update all progress entries when test endpoint is called
        await updateAllProgressEntries();
        
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
        // Update all progress entries before fetching dashboard data
        await updateAllProgressEntries();
        
        // 1. Get total customers count from certificate_details table
        const [totalCustomers] = await db.query(
            'SELECT COUNT(*) as total_customers_count FROM certificate_details'
        );

        // 2. Get overall PO line items count (total rows in certificate_details)
        const [overallPOLineItems] = await db.query(
            'SELECT COUNT(*) as total_po_lineitems_count FROM certificate_details'
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

        // 5. Get customers list with their PO line items count
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

// Save or update target for a specific date
exports.saveTarget = async (req, res) => {
    try {
        const { selected_date, target_count } = req.body;

        // Validation
        if (!selected_date) {
            return res.status(400).json({
                success: false,
                message: 'Selected date is required'
            });
        }

        if (target_count === undefined || target_count === null || target_count < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid target count is required'
            });
        }

        // Get actual completed count from certificate_details table for the selected date
        const [completedResult] = await db.query(
            `SELECT COUNT(*) as completed_count 
             FROM certificate_details 
             WHERE DATE(created_at) = ?`,
            [selected_date]
        );
        
        const completed_count = completedResult[0]?.completed_count || 0;

        // Check if entry exists for this date
        const [existing] = await db.query(
            'SELECT id FROM progress WHERE selected_date = ?',
            [selected_date]
        );

        if (existing.length > 0) {
            // Update existing entry
            await db.query(
                `UPDATE progress 
                 SET target_count = ?, completed_count = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE selected_date = ?`,
                [target_count, completed_count, selected_date]
            );
        } else {
            // Insert new entry
            await db.query(
                `INSERT INTO progress (selected_date, target_count, completed_count) 
                 VALUES (?, ?, ?)`,
                [selected_date, target_count, completed_count]
            );
        }

        // After saving, also update all other entries to ensure consistency
        await updateAllProgressEntries();

        res.status(200).json({
            success: true,
            message: existing.length > 0 ? 'Target updated successfully' : 'Target saved successfully',
            data: { 
                selected_date, 
                target_count, 
                completed_count,
                remaining: Math.max(0, target_count - completed_count),
                progress_percentage: target_count > 0 ? Math.min(100, Math.round((completed_count / target_count) * 100)) : 0
            }
        });

    } catch (error) {
        console.error('Save target error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save target',
            error: error.message
        });
    }
};

// Get certificate statistics (datewise and overall from certificate_details)
exports.getCertificateStats = async (req, res) => {
    try {
        const { date, start_date, end_date } = req.query;

        // First, update all progress entries to ensure completed counts are current
        await updateAllProgressEntries();

        // Query 1: Get datewise completed counts from certificate_details
        let datewiseQuery = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as completed_count
            FROM certificate_details
            WHERE 1=1
        `;
        
        let queryParams = [];
        
        // Add filters if provided
        if (date) {
            datewiseQuery += ` AND DATE(created_at) = ?`;
            queryParams.push(date);
        } else if (start_date && end_date) {
            datewiseQuery += ` AND DATE(created_at) BETWEEN ? AND ?`;
            queryParams.push(start_date, end_date);
        }
        
        datewiseQuery += ` GROUP BY DATE(created_at) ORDER BY date DESC`;
        
        const [datewiseResults] = await db.query(datewiseQuery, queryParams);

        // Query 2: Get overall total completed count
        const [overallResult] = await db.query(
            `SELECT COUNT(*) as total_completed FROM certificate_details`
        );

        // Query 3: Get all progress entries (targets) with updated completed counts
        const [progressEntries] = await db.query(
            'SELECT * FROM progress ORDER BY selected_date DESC'
        );

        // Create a map of datewise completed counts
        const completedMap = {};
        datewiseResults.forEach(item => {
            const dateStr = item.date.toISOString().split('T')[0];
            completedMap[dateStr] = parseInt(item.completed_count);
        });

        // Merge progress with actual completed counts and update if needed
        const mergedProgress = [];
        for (const entry of progressEntries) {
            const dateStr = entry.selected_date.toISOString().split('T')[0];
            const actualCompleted = completedMap[dateStr] || 0;
            
            // Update database if completed count changed
            if (actualCompleted !== entry.completed_count) {
                await db.query(
                    'UPDATE progress SET completed_count = ? WHERE selected_date = ?',
                    [actualCompleted, entry.selected_date]
                );
            }
            
            mergedProgress.push({
                selected_date: entry.selected_date,
                target_count: entry.target_count,
                completed_count: actualCompleted,
                remaining: Math.max(0, entry.target_count - actualCompleted),
                progress_percentage: entry.target_count > 0 
                    ? Math.min(100, Math.round((actualCompleted / entry.target_count) * 100))
                    : 0,
                created_at: entry.created_at,
                updated_at: entry.updated_at
            });
        }

        // Calculate additional statistics
        const totalCompleted = overallResult[0]?.total_completed || 0;
        
        // Get today's completed count
        const today = new Date().toISOString().split('T')[0];
        const todayCompleted = completedMap[today] || 0;
        
        // Get yesterday's completed count
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const yesterdayCompleted = completedMap[yesterdayStr] || 0;
        
        // Calculate day-over-day percentage change
        let percentageChange = 0;
        if (yesterdayCompleted > 0) {
            percentageChange = ((todayCompleted - yesterdayCompleted) / yesterdayCompleted * 100).toFixed(2);
        } else if (todayCompleted > 0) {
            percentageChange = 100;
        }

        // Get best day (maximum completions)
        const bestDay = datewiseResults.length > 0 
            ? datewiseResults.reduce((max, item) => 
                item.completed_count > max.completed_count ? item : max
              )
            : null;

        // Calculate average per day
        const averagePerDay = datewiseResults.length > 0 
            ? (totalCompleted / datewiseResults.length).toFixed(2)
            : 0;

        // Calculate total targets and achievements
        const totalTargets = progressEntries.reduce((sum, entry) => sum + entry.target_count, 0);
        const totalAchieved = mergedProgress.reduce((sum, entry) => sum + entry.completed_count, 0);
        const targetAchievementRate = totalTargets > 0 
            ? ((totalAchieved / totalTargets) * 100).toFixed(2)
            : 0;

        // Send response
        res.status(200).json({
            success: true,
            data: {
                // Certificate completion stats (from certificate_details)
                certificate_stats: {
                    overall_total: totalCompleted,
                    total_days_with_activity: datewiseResults.length,
                    average_per_day: parseFloat(averagePerDay),
                    today_completed: todayCompleted,
                    yesterday_completed: yesterdayCompleted,
                    day_over_day_change: parseFloat(percentageChange),
                    best_day: bestDay ? {
                        date: bestDay.date,
                        completed_count: parseInt(bestDay.completed_count),
                        formatted_date: new Date(bestDay.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })
                    } : null
                },
                // Target progress stats (from progress table)
                target_stats: {
                    total_targets_set: totalTargets,
                    total_achieved: totalAchieved,
                    total_remaining: Math.max(0, totalTargets - totalAchieved),
                    achievement_rate: parseFloat(targetAchievementRate),
                    total_days_with_targets: progressEntries.length
                },
                // Datewise breakdown
                datewise_completed: datewiseResults.map(item => ({
                    date: item.date,
                    completed_count: parseInt(item.completed_count),
                    formatted_date: new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                })),
                // Progress with targets
                progress_entries: mergedProgress
            }
        });

    } catch (error) {
        console.error('Get certificate stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificate statistics',
            error: error.message
        });
    }
};