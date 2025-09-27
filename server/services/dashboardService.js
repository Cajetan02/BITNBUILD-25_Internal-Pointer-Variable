const moment = require('moment');
const transactionService = require('./transactionService');
const taxService = require('./taxService');
const cibilService = require('./cibilService');

class DashboardService {
  async getOverview({ period }) {
    const mockTransactions = transactionService.generateMockTransactions(100);
    const summary = await transactionService.generateSummary(mockTransactions);
    
    return {
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netAmount: summary.netAmount,
      savingsRate: this.calculateSavingsRate(summary),
      transactionCount: summary.totalTransactions,
      topCategories: summary.topCategories,
      period,
      lastUpdated: new Date().toISOString()
    };
  }

  calculateSavingsRate(summary) {
    if (summary.totalIncome === 0) return 0;
    return ((summary.netAmount / summary.totalIncome) * 100).toFixed(2);
  }

  async getFinancialInsights() {
    const insights = [
      {
        type: 'savings',
        title: 'Savings Opportunity',
        description: 'You could save ₹5,000 more per month by reducing dining out expenses',
        impact: 'Medium',
        actionable: true,
        category: 'expense_optimization'
      },
      {
        type: 'investment',
        title: 'Investment Recommendation',
        description: 'Consider increasing your ELSS investments to maximize tax savings',
        impact: 'High',
        actionable: true,
        category: 'tax_optimization'
      },
      {
        type: 'credit',
        title: 'Credit Score Improvement',
        description: 'Your credit utilization is high. Consider paying off some credit card debt',
        impact: 'High',
        actionable: true,
        category: 'credit_health'
      },
      {
        type: 'budget',
        title: 'Budget Alert',
        description: 'You\'ve exceeded your monthly budget for entertainment by 20%',
        impact: 'Low',
        actionable: true,
        category: 'budget_management'
      }
    ];

    return insights;
  }

  async getSpendingBreakdown({ period }) {
    const mockTransactions = transactionService.generateMockTransactions(100);
    const categoryBreakdown = transactionService.getCategoryBreakdown(mockTransactions);
    
    const breakdown = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      breakdown,
      totalSpending: Object.values(categoryBreakdown).reduce((a, b) => a + b, 0),
      period,
      chartData: this.formatChartData(breakdown)
    };
  }

  formatChartData(breakdown) {
    return breakdown.map(item => ({
      name: item.category,
      value: item.amount,
      percentage: item.percentage
    }));
  }

  async getTaxProjection({ regime }) {
    const mockIncome = 800000; // 8L annual income
    const mockDeductions = {
      '80C': 150000,
      '80D': 25000,
      '24(b)': 50000
    };

    const taxCalculation = await taxService.calculateTax({
      income: mockIncome,
      deductions: mockDeductions,
      regime,
      financialYear: '2024-25'
    });

    return {
      currentYear: taxCalculation,
      projectedNextYear: this.projectNextYearTax(taxCalculation),
      optimizationOpportunities: await this.getTaxOptimizationOpportunities(),
      regimeComparison: await taxService.compareRegimes({
        income: mockIncome,
        deductions: mockDeductions
      })
    };
  }

  projectNextYearTax(currentTax) {
    const growthRate = 0.1; // 10% income growth
    const projectedIncome = currentTax.grossIncome * (1 + growthRate);
    
    return {
      grossIncome: projectedIncome,
      projectedTax: currentTax.totalTax * (1 + growthRate),
      growthRate: growthRate * 100
    };
  }

  async getTaxOptimizationOpportunities() {
    return [
      {
        section: '80C',
        currentAmount: 120000,
        maxAmount: 150000,
        potentialSavings: 9000,
        description: 'Increase ELSS investments to maximize 80C benefits',
        priority: 'High'
      },
      {
        section: '80D',
        currentAmount: 0,
        maxAmount: 25000,
        potentialSavings: 7500,
        description: 'Consider health insurance for tax benefits',
        priority: 'Medium'
      },
      {
        section: '24(b)',
        currentAmount: 0,
        maxAmount: 200000,
        potentialSavings: 60000,
        description: 'Home loan interest deduction available',
        priority: 'High'
      }
    ];
  }

  async getCibilHealth() {
    const mockTransactions = transactionService.generateMockTransactions(100);
    const mockCreditHistory = [
      { openedDate: '2020-01-01', type: 'credit_card' },
      { openedDate: '2019-06-01', type: 'personal_loan' }
    ];

    const cibilAnalysis = await cibilService.analyzeCreditScore({
      transactions: mockTransactions,
      creditHistory: mockCreditHistory
    });

    return {
      currentScore: cibilAnalysis.currentScore,
      scoreRange: this.getScoreRange(cibilAnalysis.currentScore),
      factors: cibilAnalysis.factors,
      recommendations: cibilAnalysis.recommendations.slice(0, 3),
      riskFactors: cibilAnalysis.riskFactors,
      strengths: cibilAnalysis.strengths,
      lastUpdated: new Date().toISOString()
    };
  }

  getScoreRange(score) {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    if (score >= 600) return 'Poor';
    return 'Very Poor';
  }

  async generateReport({ type, period, format }) {
    const reportData = {
      overview: await this.getOverview({ period }),
      insights: await this.getFinancialInsights(),
      spendingBreakdown: await this.getSpendingBreakdown({ period }),
      taxProjection: await this.getTaxProjection({ regime: 'new' }),
      cibilHealth: await this.getCibilHealth()
    };

    return {
      type,
      period,
      format,
      generatedAt: new Date().toISOString(),
      data: reportData,
      downloadUrl: `/api/reports/download/${type}-${period}-${Date.now()}.${format}`
    };
  }
}

module.exports = new DashboardService();
