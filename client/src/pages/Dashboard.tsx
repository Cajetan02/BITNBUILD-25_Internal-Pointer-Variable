import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditScore,
  Assessment,
  Insights,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/apiService';
import { DashboardOverview, FinancialInsight, SpendingBreakdown } from '../types';

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [spendingBreakdown, setSpendingBreakdown] = useState<SpendingBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, insightsRes, breakdownRes] = await Promise.all([
        apiService.getDashboardOverview(),
        apiService.getFinancialInsights(),
        apiService.getSpendingBreakdown(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (insightsRes.success) setInsights(insightsRes.data);
      if (breakdownRes.success) setSpendingBreakdown(breakdownRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back! Here's your financial overview.
      </Typography>

      {/* Financial Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Income</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ₹{overview?.totalIncome?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Expenses</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                ₹{overview?.totalExpenses?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Net Amount</Typography>
              </Box>
              <Typography variant="h4" color={overview?.netAmount && overview.netAmount >= 0 ? 'success.main' : 'error.main'}>
                ₹{overview?.netAmount?.toLocaleString() || '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CreditScore color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Savings Rate</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {overview?.savingsRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Spending Breakdown Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Spending Breakdown
              </Typography>
              {spendingBreakdown && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingBreakdown.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingBreakdown.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Categories Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Categories
              </Typography>
              {overview?.topCategories && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={overview.topCategories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Insights sx={{ mr: 1 }} />
                <Typography variant="h6">Financial Insights</Typography>
              </Box>
              <Grid container spacing={2}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Alert
                      severity={
                        insight.impact === 'High' ? 'error' :
                        insight.impact === 'Medium' ? 'warning' : 'info'
                      }
                      action={
                        insight.actionable ? (
                          <Button size="small" color="inherit">
                            Take Action
                          </Button>
                        ) : undefined
                      }
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2">
                        {insight.description}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
