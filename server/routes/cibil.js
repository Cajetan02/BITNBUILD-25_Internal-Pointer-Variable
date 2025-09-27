const express = require('express');
const cibilService = require('../services/cibilService');

const router = express.Router();

// Analyze CIBIL score
router.post('/analyze', async (req, res) => {
  try {
    const { transactions, creditHistory } = req.body;
    
    const analysis = await cibilService.analyzeCreditScore({
      transactions,
      creditHistory
    });
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('CIBIL analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing CIBIL score',
      error: error.message 
    });
  }
});

// Get CIBIL improvement recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { currentScore, creditHistory, financialProfile } = req.body;
    
    const recommendations = await cibilService.getImprovementRecommendations({
      currentScore,
      creditHistory,
      financialProfile
    });
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('CIBIL recommendations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting recommendations',
      error: error.message 
    });
  }
});

// Simulate what-if scenarios
router.post('/simulate', async (req, res) => {
  try {
    const { currentProfile, scenarios } = req.body;
    
    const simulations = await cibilService.simulateScenarios({
      currentProfile,
      scenarios
    });
    
    res.json({
      success: true,
      data: simulations
    });
  } catch (error) {
    console.error('CIBIL simulation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error simulating scenarios',
      error: error.message 
    });
  }
});

// Get credit health report
router.post('/health-report', async (req, res) => {
  try {
    const { transactions, creditAccounts } = req.body;
    
    const healthReport = await cibilService.generateHealthReport({
      transactions,
      creditAccounts
    });
    
    res.json({
      success: true,
      data: healthReport
    });
  } catch (error) {
    console.error('Health report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating health report',
      error: error.message 
    });
  }
});

module.exports = router;
