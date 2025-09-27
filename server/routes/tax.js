const express = require('express');
const taxService = require('../services/taxService');

const router = express.Router();

// Calculate tax liability
router.post('/calculate', async (req, res) => {
  try {
    const { income, deductions, regime, financialYear } = req.body;
    
    const taxCalculation = await taxService.calculateTax({
      income,
      deductions,
      regime: regime || 'new', // 'old' or 'new'
      financialYear: financialYear || '2024-25'
    });
    
    res.json({
      success: true,
      data: taxCalculation
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating tax',
      error: error.message 
    });
  }
});

// Get tax optimization suggestions
router.post('/optimize', async (req, res) => {
  try {
    const { transactions, currentDeductions, income } = req.body;
    
    const optimization = await taxService.optimizeTax({
      transactions,
      currentDeductions,
      income
    });
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    console.error('Tax optimization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error optimizing tax',
      error: error.message 
    });
  }
});

// Compare old vs new tax regime
router.post('/compare-regimes', async (req, res) => {
  try {
    const { income, deductions } = req.body;
    
    const comparison = await taxService.compareRegimes({
      income,
      deductions
    });
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Regime comparison error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error comparing regimes',
      error: error.message 
    });
  }
});

// Get available deductions
router.get('/deductions', async (req, res) => {
  try {
    const deductions = await taxService.getAvailableDeductions();
    
    res.json({
      success: true,
      data: deductions
    });
  } catch (error) {
    console.error('Deductions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching deductions',
      error: error.message 
    });
  }
});

module.exports = router;
