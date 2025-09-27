import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  TrendingDown,
  Compare,
  Lightbulb,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { TaxCalculation, TaxOptimization } from '../types';

const TaxCalculator: React.FC = () => {
  const [income, setIncome] = useState<number>(0);
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [deductions, setDeductions] = useState({
    '80C': 0,
    '80D': 0,
    '24(b)': 0,
    '80G': 0,
    '80E': 0,
  });
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [optimization, setOptimization] = useState<TaxOptimization | null>(null);
  const [regimeComparison, setRegimeComparison] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const deductionSections = {
    '80C': { max: 150000, description: 'Life Insurance, PPF, EPF, ELSS, etc.' },
    '80D': { max: 25000, description: 'Health Insurance Premium' },
    '24(b)': { max: 200000, description: 'Home Loan Interest' },
    '80G': { max: 0, description: 'Donations to Charitable Institutions' },
    '80E': { max: 0, description: 'Education Loan Interest' },
  };

  const calculateTax = async () => {
    if (income <= 0) return;

    setLoading(true);
    try {
      const response = await apiService.calculateTax({
        income,
        deductions,
        regime,
        financialYear: '2024-25',
      });

      if (response.success) {
        setTaxCalculation(response.data);
      }
    } catch (error) {
      console.error('Error calculating tax:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOptimization = async () => {
    if (income <= 0) return;

    setLoading(true);
    try {
      const response = await apiService.optimizeTax({
        transactions: [], // In real app, this would come from uploaded data
        currentDeductions: deductions,
        income,
      });

      if (response.success) {
        setOptimization(response.data);
      }
    } catch (error) {
      console.error('Error getting optimization:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareRegimes = async () => {
    if (income <= 0) return;

    setLoading(true);
    try {
      const response = await apiService.compareRegimes({
        income,
        deductions,
      });

      if (response.success) {
        setRegimeComparison(response.data);
      }
    } catch (error) {
      console.error('Error comparing regimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + amount, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tax Calculator
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Calculate your tax liability and optimize your deductions.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tax Calculation Input
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Annual Income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    helperText="Enter your gross annual income"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tax Regime</InputLabel>
                    <Select
                      value={regime}
                      onChange={(e) => setRegime(e.target.value as 'old' | 'new')}
                    >
                      <MenuItem value="new">New Tax Regime</MenuItem>
                      <MenuItem value="old">Old Tax Regime</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Deductions
                  </Typography>
                </Grid>

                {Object.entries(deductionSections).map(([section, info]) => (
                  <Grid item xs={12} key={section}>
                    <TextField
                      fullWidth
                      label={`Section ${section}`}
                      type="number"
                      value={deductions[section as keyof typeof deductions]}
                      onChange={(e) => setDeductions(prev => ({
                        ...prev,
                        [section]: Number(e.target.value)
                      }))}
                      helperText={info.description}
                      inputProps={{ max: info.max || undefined }}
                    />
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={calculateTax}
                      disabled={loading || income <= 0}
                      startIcon={<Calculate />}
                    >
                      Calculate Tax
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={getOptimization}
                      disabled={loading || income <= 0}
                      startIcon={<Lightbulb />}
                    >
                      Get Optimization
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={compareRegimes}
                      disabled={loading || income <= 0}
                      startIcon={<Compare />}
                    >
                      Compare Regimes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {taxCalculation && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tax Calculation Results
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        ₹{taxCalculation.totalTax.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Tax
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {taxCalculation.effectiveRate.toFixed(2)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Effective Rate
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Breakdown:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Gross Income:</Typography>
                    <Typography variant="body2">₹{taxCalculation.grossIncome.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Total Deductions:</Typography>
                    <Typography variant="body2">₹{taxCalculation.totalDeductions.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Taxable Income:</Typography>
                    <Typography variant="body2">₹{taxCalculation.taxableIncome.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tax:</Typography>
                    <Typography variant="body2">₹{taxCalculation.tax.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Cess (4%):</Typography>
                    <Typography variant="body2">₹{taxCalculation.cess.toLocaleString()}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="bold">Total Tax:</Typography>
                    <Typography variant="body2" fontWeight="bold">₹{taxCalculation.totalTax.toLocaleString()}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {optimization && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tax Optimization Suggestions
                </Typography>
                
                {optimization.suggestions.map((suggestion, index) => (
                  <Alert key={index} severity="info" sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Section {suggestion.section}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {suggestion.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={`Current: ₹${suggestion.currentAmount.toLocaleString()}`}
                        size="small"
                        color="default"
                      />
                      <Chip
                        label={`Potential: ₹${suggestion.potentialAmount.toLocaleString()}`}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={`Savings: ₹${suggestion.savings.toLocaleString()}`}
                        size="small"
                        color="success"
                      />
                    </Box>
                  </Alert>
                ))}

                <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light' }}>
                  <Typography variant="h6" color="success.dark">
                    Total Potential Savings: ₹{optimization.totalPotentialSavings.toLocaleString()}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {regimeComparison && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regime Comparison
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="primary">
                        ₹{regimeComparison.oldRegime.totalTax.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Old Regime
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" color="secondary">
                        ₹{regimeComparison.newRegime.totalTax.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        New Regime
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Alert 
                  severity={regimeComparison.recommendation === 'old' ? 'warning' : 'success'}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="subtitle2">
                    Recommendation: {regimeComparison.recommendation === 'old' ? 'Old' : 'New'} Regime
                  </Typography>
                  <Typography variant="body2">
                    You can save ₹{regimeComparison.savings.toLocaleString()} by choosing the {regimeComparison.recommendation} regime.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TaxCalculator;
