const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());                        // Allow frontend to connect
app.use(express.json({ limit: '10mb' }));

// ==================== STATIC FILE SERVING ====================
// Serve uploaded files statically - This must come BEFORE API routes
const uploadsDir = path.join(__dirname, 'uploads');
const inspectionCertificatesDir = path.join(uploadsDir, 'inspection_certificates');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}
if (!fs.existsSync(inspectionCertificatesDir)) {
  fs.mkdirSync(inspectionCertificatesDir, { recursive: true });
  console.log('Created inspection_certificates directory:', inspectionCertificatesDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Optional: Log when static files are accessed
app.use('/uploads', (req, res, next) => {
  console.log(`Static file requested: ${req.path}`);
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const sheetRoutes = require('./routes/sheetRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/sheet', sheetRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check route (optional but useful)
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling for static files (optional)
app.use('/uploads', (err, req, res, next) => {
  if (err.status === 404) {
    console.error('Static file not found:', req.path);
    res.status(404).json({ error: 'File not found' });
  } else {
    next(err);
  }
});

const startServer = async () => {
  try {
    const db = await connectDB();

    // Simple test query to verify connection
    await db.query('SELECT 1');

    console.log('Database connected successfully');
    console.log(`Uploads directory: ${uploadsDir}`);
    console.log(`Inspection certificates directory: ${inspectionCertificatesDir}`);

    app.listen(PORT, () => {
      console.log(`Server running on http://103.118.158.188:${PORT}`);
      console.log(`Static files available at: http://103.118.158.188:${PORT}/uploads/`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();