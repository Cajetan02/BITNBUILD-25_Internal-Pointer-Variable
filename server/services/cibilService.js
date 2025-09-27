const moment = require('moment');

class CibilService {
  constructor() {
    this.creditFactors = {
      paymentHistory: 35, // 35% weight
      creditUtilization: 30, // 30% weight
      creditAge: 15, // 15% weight
      creditMix: 10, // 10% weight
      newCredit: 10 // 10% weight
    };
  }

  async analyzeCreditScore({ transactions, creditHistory }) {
    const analysis = {
      currentScore: this.calculateCurrentScore(transactions, creditHistory),
      factors: this.analyzeCreditFactors(transactions, creditHistory),
      recommendations: [],
      riskFactors: [],
      strengths: []
    };

    // Generate recommendations based on analysis
    analysis.recommendations = this.generateRecommendations(analysis.factors);
    
    // Identify risk factors
    analysis.riskFactors = this.identifyRiskFactors(transactions, creditHistory);
    
    // Identify strengths
    analysis.strengths = this.identifyStrengths(transactions, creditHistory);

    return analysis;
  }

  calculateCurrentScore(transactions, creditHistory) {
    // Simplified CIBIL score calculation
    let score = 750; // Base score
    
    // Payment history analysis
    const paymentHistory = this.analyzePaymentHistory(transactions);
    score += paymentHistory.score;
    
    // Credit utilization analysis
    const utilization = this.analyzeCreditUtilization(transactions);
    score += utilization.score;
    
    // Credit age analysis
    const creditAge = this.analyzeCreditAge(creditHistory);
    score += creditAge.score;
    
    // Credit mix analysis
    const creditMix = this.analyzeCreditMix(transactions);
    score += creditMix.score;
    
    // New credit analysis
    const newCredit = this.analyzeNewCredit(transactions);
    score += newCredit.score;
    
    return Math.max(300, Math.min(900, score));
  }

  analyzeCreditFactors(transactions, creditHistory) {
    return {
      paymentHistory: this.analyzePaymentHistory(transactions),
      creditUtilization: this.analyzeCreditUtilization(transactions),
      creditAge: this.analyzeCreditAge(creditHistory),
      creditMix: this.analyzeCreditMix(transactions),
      newCredit: this.analyzeNewCredit(transactions)
    };
  }

  analyzePaymentHistory(transactions) {
    const creditTransactions = transactions.filter(t => 
      t.type === 'credit' && t.category === 'credit_card'
    );
    
    const totalPayments = creditTransactions.length;
    const onTimePayments = creditTransactions.filter(t => 
      !t.description.toLowerCase().includes('late') && 
      !t.description.toLowerCase().includes('overdue')
    ).length;
    
    const onTimePercentage = totalPayments > 0 ? (onTimePayments / totalPayments) * 100 : 100;
    
    let score = 0;
    if (onTimePercentage >= 95) score = 50;
    else if (onTimePercentage >= 90) score = 40;
    else if (onTimePercentage >= 80) score = 30;
    else if (onTimePercentage >= 70) score = 20;
    else score = 10;
    
    return {
      score,
      onTimePercentage,
      totalPayments,
      onTimePayments,
      weight: this.creditFactors.paymentHistory
    };
  }

  analyzeCreditUtilization(transactions) {
    const creditCardTransactions = transactions.filter(t => 
      t.category === 'credit_card'
    );
    
    // Simplified utilization calculation
    const totalCreditLimit = 100000; // Assume 1L limit
    const totalSpending = creditCardTransactions.reduce((sum, t) => 
      sum + Math.abs(t.amount), 0
    );
    
    const utilizationPercentage = (totalSpending / totalCreditLimit) * 100;
    
    let score = 0;
    if (utilizationPercentage <= 30) score = 50;
    else if (utilizationPercentage <= 50) score = 40;
    else if (utilizationPercentage <= 70) score = 30;
    else if (utilizationPercentage <= 90) score = 20;
    else score = 10;
    
    return {
      score,
      utilizationPercentage,
      totalSpending,
      creditLimit: totalCreditLimit,
      weight: this.creditFactors.creditUtilization
    };
  }

  analyzeCreditAge(creditHistory) {
    if (!creditHistory || creditHistory.length === 0) {
      return { score: 0, averageAge: 0, weight: this.creditFactors.creditAge };
    }
    
    const now = moment();
    const ages = creditHistory.map(account => 
      now.diff(moment(account.openedDate), 'years')
    );
    
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    
    let score = 0;
    if (averageAge >= 7) score = 50;
    else if (averageAge >= 5) score = 40;
    else if (averageAge >= 3) score = 30;
    else if (averageAge >= 1) score = 20;
    else score = 10;
    
    return {
      score,
      averageAge,
      weight: this.creditFactors.creditAge
    };
  }

  analyzeCreditMix(transactions) {
    const creditTypes = new Set();
    
    transactions.forEach(transaction => {
      if (transaction.category === 'credit_card') creditTypes.add('credit_card');
      if (transaction.category === 'loan') creditTypes.add('loan');
      if (transaction.category === 'home_loan') creditTypes.add('home_loan');
      if (transaction.category === 'personal_loan') creditTypes.add('personal_loan');
    });
    
    const diversityScore = creditTypes.size * 10; // Max 50 for 5+ types
    
    return {
      score: Math.min(50, diversityScore),
      creditTypes: Array.from(creditTypes),
      weight: this.creditFactors.creditMix
    };
  }

  analyzeNewCredit(transactions) {
    const sixMonthsAgo = moment().subtract(6, 'months');
    const recentCreditApplications = transactions.filter(t => 
      t.date >= sixMonthsAgo && 
      (t.description.toLowerCase().includes('application') || 
       t.description.toLowerCase().includes('enquiry'))
    );
    
    let score = 50; // Start with max score
    recentCreditApplications.forEach(() => {
      score -= 10; // Deduct 10 points for each recent application
    });
    
    return {
      score: Math.max(0, score),
      recentApplications: recentCreditApplications.length,
      weight: this.creditFactors.newCredit
    };
  }

  generateRecommendations(factors) {
    const recommendations = [];
    
    // Payment history recommendations
    if (factors.paymentHistory.onTimePercentage < 95) {
      recommendations.push({
        category: 'Payment History',
        priority: 'High',
        title: 'Improve Payment Timeliness',
        description: 'Ensure all credit card bills and loan EMIs are paid on time',
        impact: 'High',
        timeline: 'Immediate'
      });
    }
    
    // Credit utilization recommendations
    if (factors.creditUtilization.utilizationPercentage > 30) {
      recommendations.push({
        category: 'Credit Utilization',
        priority: 'High',
        title: 'Reduce Credit Card Usage',
        description: 'Keep credit card utilization below 30% of available limit',
        impact: 'High',
        timeline: '1-3 months'
      });
    }
    
    // Credit age recommendations
    if (factors.creditAge.averageAge < 3) {
      recommendations.push({
        category: 'Credit Age',
        priority: 'Medium',
        title: 'Build Credit History',
        description: 'Maintain existing credit accounts and avoid closing old accounts',
        impact: 'Medium',
        timeline: '6-12 months'
      });
    }
    
    // Credit mix recommendations
    if (factors.creditMix.creditTypes.length < 2) {
      recommendations.push({
        category: 'Credit Mix',
        priority: 'Low',
        title: 'Diversify Credit Portfolio',
        description: 'Consider adding different types of credit (secured loans, etc.)',
        impact: 'Low',
        timeline: '6-12 months'
      });
    }
    
    return recommendations;
  }

  identifyRiskFactors(transactions, creditHistory) {
    const risks = [];
    
    // Late payments
    const latePayments = transactions.filter(t => 
      t.description.toLowerCase().includes('late') || 
      t.description.toLowerCase().includes('overdue')
    );
    
    if (latePayments.length > 0) {
      risks.push({
        factor: 'Late Payments',
        severity: 'High',
        count: latePayments.length,
        description: 'Recent late payments can significantly impact credit score'
      });
    }
    
    // High utilization
    const highUtilization = transactions.filter(t => 
      t.category === 'credit_card' && Math.abs(t.amount) > 50000
    );
    
    if (highUtilization.length > 0) {
      risks.push({
        factor: 'High Credit Usage',
        severity: 'Medium',
        count: highUtilization.length,
        description: 'High credit card usage may indicate financial stress'
      });
    }
    
    // Multiple recent applications
    const recentApplications = transactions.filter(t => 
      t.date >= moment().subtract(3, 'months') && 
      t.description.toLowerCase().includes('application')
    );
    
    if (recentApplications.length > 2) {
      risks.push({
        factor: 'Multiple Credit Applications',
        severity: 'Medium',
        count: recentApplications.length,
        description: 'Multiple recent credit applications can lower credit score'
      });
    }
    
    return risks;
  }

  identifyStrengths(transactions, creditHistory) {
    const strengths = [];
    
    // Good payment history
    const onTimePayments = transactions.filter(t => 
      t.type === 'credit' && !t.description.toLowerCase().includes('late')
    );
    
    if (onTimePayments.length > 0) {
      strengths.push({
        factor: 'Consistent On-Time Payments',
        description: 'Regular on-time payments demonstrate creditworthiness'
      });
    }
    
    // Low utilization
    const totalSpending = transactions
      .filter(t => t.category === 'credit_card')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (totalSpending < 30000) { // Assuming 1L limit
      strengths.push({
        factor: 'Low Credit Utilization',
        description: 'Low credit card usage shows responsible credit management'
      });
    }
    
    // Long credit history
    if (creditHistory && creditHistory.length > 0) {
      const oldestAccount = Math.min(...creditHistory.map(account => 
        moment(account.openedDate).valueOf()
      ));
      const creditAge = moment().diff(moment(oldestAccount), 'years');
      
      if (creditAge > 5) {
        strengths.push({
          factor: 'Long Credit History',
          description: 'Established credit history demonstrates stability'
        });
      }
    }
    
    return strengths;
  }

  async getImprovementRecommendations({ currentScore, creditHistory, financialProfile }) {
    const recommendations = [];
    
    if (currentScore < 600) {
      recommendations.push({
        priority: 'Critical',
        title: 'Build Basic Credit History',
        description: 'Start with a secured credit card or small personal loan',
        expectedImprovement: '+50-100 points',
        timeline: '6-12 months'
      });
    } else if (currentScore < 700) {
      recommendations.push({
        priority: 'High',
        title: 'Improve Payment History',
        description: 'Ensure all payments are made on time for at least 6 months',
        expectedImprovement: '+30-50 points',
        timeline: '3-6 months'
      });
    } else if (currentScore < 750) {
      recommendations.push({
        priority: 'Medium',
        title: 'Optimize Credit Utilization',
        description: 'Keep credit card usage below 30% of available limit',
        expectedImprovement: '+20-30 points',
        timeline: '1-3 months'
      });
    } else {
      recommendations.push({
        priority: 'Low',
        title: 'Maintain Excellent Credit',
        description: 'Continue current practices and monitor credit regularly',
        expectedImprovement: 'Maintain current score',
        timeline: 'Ongoing'
      });
    }
    
    return recommendations;
  }

  async simulateScenarios({ currentProfile, scenarios }) {
    const simulations = [];
    
    scenarios.forEach(scenario => {
      const simulatedScore = this.calculateScenarioScore(currentProfile, scenario);
      const scoreChange = simulatedScore - currentProfile.currentScore;
      
      simulations.push({
        scenario: scenario.name,
        currentScore: currentProfile.currentScore,
        simulatedScore,
        scoreChange,
        impact: this.getScoreImpact(scoreChange),
        description: scenario.description,
        actions: scenario.actions
      });
    });
    
    return simulations;
  }

  calculateScenarioScore(currentProfile, scenario) {
    let score = currentProfile.currentScore;
    
    // Apply scenario changes
    if (scenario.improvePaymentHistory) {
      score += 20;
    }
    if (scenario.reduceUtilization) {
      score += 15;
    }
    if (scenario.addCreditMix) {
      score += 10;
    }
    if (scenario.reduceNewCredit) {
      score += 5;
    }
    
    return Math.min(900, score);
  }

  getScoreImpact(scoreChange) {
    if (scoreChange > 20) return 'High';
    if (scoreChange > 10) return 'Medium';
    if (scoreChange > 0) return 'Low';
    return 'Negative';
  }

  async generateHealthReport({ transactions, creditAccounts }) {
    const report = {
      overallHealth: 'Good',
      score: this.calculateCurrentScore(transactions, creditAccounts),
      factors: this.analyzeCreditFactors(transactions, creditAccounts),
      trends: this.analyzeTrends(transactions),
      recommendations: this.generateRecommendations(
        this.analyzeCreditFactors(transactions, creditAccounts)
      ),
      nextSteps: this.getNextSteps(transactions, creditAccounts)
    };
    
    return report;
  }

  analyzeTrends(transactions) {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    
    return {
      paymentTrend: this.analyzePaymentTrend(monthlyData),
      utilizationTrend: this.analyzeUtilizationTrend(monthlyData),
      spendingTrend: this.analyzeSpendingTrend(monthlyData)
    };
  }

  groupTransactionsByMonth(transactions) {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const month = moment(transaction.date).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = [];
      }
      monthlyData[month].push(transaction);
    });
    
    return monthlyData;
  }

  analyzePaymentTrend(monthlyData) {
    // Simplified trend analysis
    return 'Stable';
  }

  analyzeUtilizationTrend(monthlyData) {
    // Simplified trend analysis
    return 'Stable';
  }

  analyzeSpendingTrend(monthlyData) {
    // Simplified trend analysis
    return 'Stable';
  }

  getNextSteps(transactions, creditAccounts) {
    return [
      'Monitor credit utilization monthly',
      'Set up payment reminders',
      'Review credit report quarterly',
      'Consider credit limit increase if utilization is low'
    ];
  }
}

module.exports = new CibilService();
