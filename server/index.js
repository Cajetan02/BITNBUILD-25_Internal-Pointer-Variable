const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.pdf'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLSX, and PDF files are allowed.'));
    }
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/tax', require('./routes/tax'));
app.use('/api/cibil', require('./routes/cibil'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TaxWise server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
});

module.exports = app;
