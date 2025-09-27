const express = require('express');
const dashboardService = require('../services/dashboardService');

const router = express.Router();

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const overview = await dashboardService.getOverview({ period });
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard overview',
      error: error.message 
    });
  }
});

// Get financial insights
router.get('/insights', async (req, res) => {
  try {
    const insights = await dashboardService.getFinancialInsights();
    
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching insights',
      error: error.message 
    });
  }
});

// Get spending breakdown
router.get('/spending-breakdown', async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const breakdown = await dashboardService.getSpendingBreakdown({ period });
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Spending breakdown error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching spending breakdown',
      error: error.message 
    });
  }
});

// Get tax projection
router.get('/tax-projection', async (req, res) => {
  try {
    const { regime = 'new' } = req.query;
    
    const projection = await dashboardService.getTaxProjection({ regime });
    
    res.json({
      success: true,
      data: projection
    });
  } catch (error) {
    console.error('Tax projection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching tax projection',
      error: error.message 
    });
  }
});

// Get CIBIL health
router.get('/cibil-health', async (req, res) => {
  try {
    const health = await dashboardService.getCibilHealth();
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('CIBIL health error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching CIBIL health',
      error: error.message 
    });
  }
});

// Generate report
router.post('/generate-report', async (req, res) => {
  try {
    const { type, period, format = 'pdf' } = req.body;
    
    const report = await dashboardService.generateReport({
      type,
      period,
      format
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating report',
      error: error.message 
    });
  }
});

module.exports = router;
