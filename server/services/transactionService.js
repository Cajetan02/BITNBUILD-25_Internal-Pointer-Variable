const moment = require('moment');
const _ = require('lodash');

class TransactionService {
  constructor() {
    this.categories = {
      income: ['salary', 'freelance', 'business', 'investment', 'rental'],
      expenses: ['food', 'transport', 'entertainment', 'shopping', 'utilities', 'healthcare'],
      investments: ['mutual_fund', 'stocks', 'ppf', 'epf', 'elss', 'nps'],
      loans: ['home_loan', 'personal_loan', 'car_loan', 'education_loan'],
      insurance: ['life_insurance', 'health_insurance', 'car_insurance'],
      credit: ['credit_card', 'emi', 'loan_payment']
    };
  }

  async processTransactions(transactions) {
    const processedTransactions = transactions.map(transaction => {
      return {
        ...transaction,
        id: this.generateId(),
        category: this.categorizeTransaction(transaction),
        type: this.determineTransactionType(transaction),
        isRecurring: this.isRecurringTransaction(transaction),
        processedAt: new Date().toISOString()
      };
    });

    return processedTransactions;
  }

  categorizeTransaction(transaction) {
    const description = transaction.description.toLowerCase();
    const amount = Math.abs(transaction.amount);
    
    // Income patterns
    if (description.includes('salary') || description.includes('wage')) {
      return 'salary';
    }
    if (description.includes('freelance') || description.includes('consulting')) {
      return 'freelance';
    }
    if (description.includes('rent') || description.includes('rental')) {
      return 'rental_income';
    }
    if (description.includes('dividend') || description.includes('interest')) {
      return 'investment_income';
    }
    
    // Expense patterns
    if (description.includes('food') || description.includes('restaurant') || 
        description.includes('grocery') || description.includes('dining')) {
      return 'food';
    }
    if (description.includes('fuel') || description.includes('petrol') || 
        description.includes('uber') || description.includes('ola') || 
        description.includes('metro') || description.includes('bus')) {
      return 'transport';
    }
    if (description.includes('movie') || description.includes('entertainment') || 
        description.includes('netflix') || description.includes('spotify')) {
      return 'entertainment';
    }
    if (description.includes('shopping') || description.includes('amazon') || 
        description.includes('flipkart') || description.includes('mall')) {
      return 'shopping';
    }
    if (description.includes('electricity') || description.includes('water') || 
        description.includes('gas') || description.includes('utility')) {
      return 'utilities';
    }
    if (description.includes('hospital') || description.includes('medical') || 
        description.includes('pharmacy') || description.includes('doctor')) {
      return 'healthcare';
    }
    
    // Investment patterns
    if (description.includes('mutual fund') || description.includes('mf')) {
      return 'mutual_fund';
    }
    if (description.includes('ppf') || description.includes('public provident fund')) {
      return 'ppf';
    }
    if (description.includes('epf') || description.includes('employee provident fund')) {
      return 'epf';
    }
    if (description.includes('elss') || description.includes('tax saving')) {
      return 'elss';
    }
    if (description.includes('nps') || description.includes('pension')) {
      return 'nps';
    }
    
    // Loan patterns
    if (description.includes('home loan') || description.includes('housing loan')) {
      return 'home_loan';
    }
    if (description.includes('personal loan')) {
      return 'personal_loan';
    }
    if (description.includes('car loan') || description.includes('auto loan')) {
      return 'car_loan';
    }
    if (description.includes('education loan')) {
      return 'education_loan';
    }
    
    // Insurance patterns
    if (description.includes('life insurance') || description.includes('lic')) {
      return 'life_insurance';
    }
    if (description.includes('health insurance') || description.includes('medical insurance')) {
      return 'health_insurance';
    }
    if (description.includes('car insurance') || description.includes('vehicle insurance')) {
      return 'car_insurance';
    }
    
    // Credit patterns
    if (description.includes('credit card') || description.includes('cc')) {
      return 'credit_card';
    }
    if (description.includes('emi') || description.includes('installment')) {
      return 'emi';
    }
    
    // Default categorization
    if (amount > 10000) {
      return 'large_expense';
    } else if (amount > 1000) {
      return 'medium_expense';
    } else {
      return 'small_expense';
    }
  }

  determineTransactionType(transaction) {
    const amount = transaction.amount;
    if (amount > 0) {
      return 'credit';
    } else {
      return 'debit';
    }
  }

  isRecurringTransaction(transaction) {
    // This is a simplified check - in production, you'd analyze historical data
    const description = transaction.description.toLowerCase();
    const recurringKeywords = ['salary', 'rent', 'emi', 'sip', 'subscription', 'monthly'];
    
    return recurringKeywords.some(keyword => description.includes(keyword));
  }

  generateId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getTransactions({ page, limit, category, type, dateFrom, dateTo }) {
    // In production, this would query a database
    // For now, return mock data
    const mockTransactions = this.generateMockTransactions(100);
    
    let filteredTransactions = mockTransactions;
    
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    
    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(t => 
        moment(t.date).isAfter(moment(dateFrom))
      );
    }
    
    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(t => 
        moment(t.date).isBefore(moment(dateTo))
      );
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      transactions: filteredTransactions.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        pages: Math.ceil(filteredTransactions.length / limit)
      }
    };
  }

  async categorizeTransactions(transactions) {
    return transactions.map(transaction => ({
      ...transaction,
      category: this.categorizeTransaction(transaction),
      type: this.determineTransactionType(transaction)
    }));
  }

  async getSpendingAnalysis({ period, category }) {
    const mockTransactions = this.generateMockTransactions(100);
    
    const analysis = {
      totalSpending: mockTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
      categoryBreakdown: this.getCategoryBreakdown(mockTransactions),
      monthlyTrend: this.getMonthlyTrend(mockTransactions),
      topExpenses: this.getTopExpenses(mockTransactions),
      savingsRate: this.calculateSavingsRate(mockTransactions)
    };
    
    return analysis;
  }

  getCategoryBreakdown(transactions) {
    const breakdown = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category;
      if (!breakdown[category]) {
        breakdown[category] = 0;
      }
      breakdown[category] += Math.abs(transaction.amount);
    });
    
    return breakdown;
  }

  getMonthlyTrend(transactions) {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const month = moment(transaction.date).format('YYYY-MM');
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += Math.abs(transaction.amount);
    });
    
    return monthlyData;
  }

  getTopExpenses(transactions) {
    return transactions
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 10);
  }

  calculateSavingsRate(transactions) {
    const income = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (income === 0) return 0;
    
    return ((income - expenses) / income) * 100;
  }

  async getRecurringTransactions() {
    const mockTransactions = this.generateMockTransactions(100);
    
    return mockTransactions.filter(transaction => 
      this.isRecurringTransaction(transaction)
    );
  }

  async updateTransactionCategory(id, category) {
    // In production, this would update the database
    return {
      id,
      category,
      updatedAt: new Date().toISOString()
    };
  }

  async generateSummary(transactions) {
    const totalIncome = transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const categoryBreakdown = this.getCategoryBreakdown(transactions);
    
    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      categoryBreakdown,
      topCategories: Object.entries(categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }))
    };
  }

  generateMockTransactions(count) {
    const transactions = [];
    const categories = Object.keys(this.categories).flat();
    const descriptions = [
      'Salary Credit', 'ATM Withdrawal', 'Online Purchase', 'Restaurant Bill',
      'Fuel Payment', 'EMI Payment', 'Insurance Premium', 'Mutual Fund SIP',
      'Credit Card Payment', 'Utility Bill', 'Medical Expense', 'Entertainment',
      'Grocery Shopping', 'Transport Fare', 'Investment', 'Rent Payment'
    ];
    
    for (let i = 0; i < count; i++) {
      const isCredit = Math.random() > 0.7;
      const amount = isCredit ? 
        Math.random() * 50000 + 10000 : 
        -(Math.random() * 5000 + 100);
      
      transactions.push({
        id: this.generateId(),
        date: moment().subtract(Math.floor(Math.random() * 365), 'days').format('YYYY-MM-DD'),
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        amount: Math.round(amount),
        category: categories[Math.floor(Math.random() * categories.length)],
        type: isCredit ? 'credit' : 'debit',
        isRecurring: Math.random() > 0.8
      });
    }
    
    return transactions;
  }
}

module.exports = new TransactionService();
