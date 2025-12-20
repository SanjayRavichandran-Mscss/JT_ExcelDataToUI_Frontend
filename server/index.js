const express = require('express');
const { connectDB } = require('./config/db');

const app = express();
const PORT = 5000;

app.use(express.json({ limit: '10mb' }));

const excelRoutes = require('./routes/excelRoutes');
app.use('/api/excel', excelRoutes);

const startServer = async () => {
  const db = await connectDB();

  if (db) {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
};

startServer();