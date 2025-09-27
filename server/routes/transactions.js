const express = require('express');
const transactionService = require('../services/transactionService');

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, category, type, dateFrom, dateTo } = req.query;
    
    const transactions = await transactionService.getTransactions({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type,
      dateFrom,
      dateTo
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching transactions',
      error: error.message 
    });
  }
});

// Categorize transactions
router.post('/categorize', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    const categorizedTransactions = await transactionService.categorizeTransactions(transactions);
    
    res.json({
      success: true,
      data: categorizedTransactions
    });
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error categorizing transactions',
      error: error.message 
    });
  }
});

// Get spending analysis
router.get('/analysis', async (req, res) => {
  try {
    const { period = 'month', category } = req.query;
    
    const analysis = await transactionService.getSpendingAnalysis({
      period,
      category
    });
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing spending',
      error: error.message 
    });
  }
});

// Get recurring transactions
router.get('/recurring', async (req, res) => {
  try {
    const recurringTransactions = await transactionService.getRecurringTransactions();
    
    res.json({
      success: true,
      data: recurringTransactions
    });
  } catch (error) {
    console.error('Recurring transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recurring transactions',
      error: error.message 
    });
  }
});

// Update transaction category
router.put('/:id/category', async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    
    const updatedTransaction = await transactionService.updateTransactionCategory(id, category);
    
    res.json({
      success: true,
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating category',
      error: error.message 
    });
  }
});

module.exports = router;
