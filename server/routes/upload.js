const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');
const transactionService = require('../services/transactionService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload bank statement
router.post('/bank-statement', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    
    let transactions = [];
    
    if (fileType === '.csv') {
      transactions = await parseCSV(filePath);
    } else if (fileType === '.xlsx') {
      transactions = await parseExcel(filePath);
    } else if (fileType === '.pdf') {
      transactions = await parsePDF(filePath);
    }

    // Process and categorize transactions
    const processedTransactions = await transactionService.processTransactions(transactions);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        totalTransactions: processedTransactions.length,
        transactions: processedTransactions.slice(0, 10), // Return first 10 for preview
        summary: await transactionService.generateSummary(processedTransactions)
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing file',
      error: error.message 
    });
  }
});

// Parse CSV file
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Parse Excel file
async function parseExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

// Parse PDF file (basic implementation)
async function parsePDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  
  // Basic parsing - in production, you'd use more sophisticated PDF parsing
  const lines = data.text.split('\n');
  const transactions = [];
  
  lines.forEach(line => {
    // Look for transaction patterns (this is simplified)
    const amountMatch = line.match(/(\d+\.?\d*)/);
    if (amountMatch) {
      transactions.push({
        description: line,
        amount: parseFloat(amountMatch[1]),
        date: new Date().toISOString().split('T')[0]
      });
    }
  });
  
  return transactions;
}

module.exports = router;
