const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());                        // Allow frontend to connect
app.use(express.json({ limit: '10mb' }));

// Routes
const authRoutes = require('./routes/authRoutes');
const excelRoutes = require('./routes/excelRoutes');
const sheetRoutes = require('./routes/sheetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/sheet', sheetRoutes);

// Health check route (optional but useful)
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

const startServer = async () => {
  try {
    const db = await connectDB();

    // Simple test query to verify connection
    await db.query('SELECT 1');

    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://103.118.158.113.188:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();