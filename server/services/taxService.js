const moment = require('moment');

class TaxService {
  constructor() {
    this.taxSlabs = {
      '2024-25': {
        new: [
          { min: 0, max: 300000, rate: 0 },
          { min: 300001, max: 600000, rate: 5 },
          { min: 600001, max: 900000, rate: 10 },
          { min: 900001, max: 1200000, rate: 15 },
          { min: 1200001, max: 1500000, rate: 20 },
          { min: 1500001, max: Infinity, rate: 30 }
        ],
        old: [
          { min: 0, max: 250000, rate: 0 },
          { min: 250001, max: 500000, rate: 5 },
          { min: 500001, max: 1000000, rate: 20 },
          { min: 1000001, max: Infinity, rate: 30 }
        ]
      }
    };
    
    this.deductionSections = {
      '80C': { max: 150000, description: 'Life Insurance, PPF, EPF, ELSS, etc.' },
      '80D': { max: 25000, description: 'Health Insurance Premium' },
      '80G': { max: 0, description: 'Donations to Charitable Institutions' },
      '24(b)': { max: 200000, description: 'Home Loan Interest' },
      '80E': { max: 0, description: 'Education Loan Interest' },
      '80EE': { max: 50000, description: 'First-time Home Buyer Interest' },
      '80EEA': { max: 150000, description: 'Affordable Housing Interest' },
      '80EEB': { max: 150000, description: 'Electric Vehicle Loan Interest' },
      '80TTA': { max: 10000, description: 'Savings Account Interest' },
      '80TTB': { max: 50000, description: 'Senior Citizen Interest' }
    };
  }

  async calculateTax({ income, deductions, regime, financialYear }) {
    const grossIncome = income;
    const totalDeductions = this.calculateTotalDeductions(deductions);
    const taxableIncome = Math.max(0, grossIncome - totalDeductions);
    
    const taxSlabs = this.taxSlabs[financialYear][regime];
    let tax = 0;
    
    for (const slab of taxSlabs) {
      if (taxableIncome > slab.min) {
        const slabIncome = Math.min(taxableIncome, slab.max) - slab.min;
        tax += slabIncome * (slab.rate / 100);
      }
    }
    
    const cess = tax * 0.04; // 4% cess
    const totalTax = tax + cess;
    
    return {
      grossIncome,
      totalDeductions,
      taxableIncome,
      tax,
      cess,
      totalTax,
      effectiveRate: (totalTax / grossIncome) * 100,
      regime,
      financialYear
    };
  }

  calculateTotalDeductions(deductions) {
    let total = 0;
    for (const [section, amount] of Object.entries(deductions)) {
      const maxAllowed = this.deductionSections[section]?.max || 0;
      const allowedAmount = maxAllowed === 0 ? amount : Math.min(amount, maxAllowed);
      total += allowedAmount;
    }
    return total;
  }

  async optimizeTax({ transactions, currentDeductions, income }) {
    const suggestions = [];
    
    // Analyze transactions for potential deductions
    const analysis = this.analyzeTransactionsForDeductions(transactions);
    
    // Check for missed 80C opportunities
    if (currentDeductions['80C'] < 150000) {
      const potential80C = this.findPotential80CDeductions(transactions);
      if (potential80C > 0) {
        suggestions.push({
          section: '80C',
          currentAmount: currentDeductions['80C'] || 0,
          potentialAmount: Math.min(potential80C, 150000),
          description: 'Consider investing in ELSS, PPF, or EPF to maximize 80C benefits',
          savings: this.calculateTaxSavings(potential80C, income)
        });
      }
    }
    
    // Check for health insurance
    if (!currentDeductions['80D'] || currentDeductions['80D'] < 25000) {
      const healthInsurance = this.findHealthInsurancePayments(transactions);
      if (healthInsurance > 0) {
        suggestions.push({
          section: '80D',
          currentAmount: currentDeductions['80D'] || 0,
          potentialAmount: Math.min(healthInsurance, 25000),
          description: 'Claim health insurance premium as deduction',
          savings: this.calculateTaxSavings(healthInsurance, income)
        });
      }
    }
    
    // Check for home loan interest
    const homeLoanInterest = this.findHomeLoanInterest(transactions);
    if (homeLoanInterest > 0 && (!currentDeductions['24(b)'] || currentDeductions['24(b)'] < homeLoanInterest)) {
      suggestions.push({
        section: '24(b)',
        currentAmount: currentDeductions['24(b)'] || 0,
        potentialAmount: Math.min(homeLoanInterest, 200000),
        description: 'Claim home loan interest as deduction',
        savings: this.calculateTaxSavings(homeLoanInterest, income)
      });
    }
    
    return {
      suggestions,
      totalPotentialSavings: suggestions.reduce((sum, s) => sum + s.savings, 0),
      analysis
    };
  }

  analyzeTransactionsForDeductions(transactions) {
    const categories = {
      insurance: [],
      investments: [],
      homeLoan: [],
      donations: [],
      education: []
    };
    
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      const amount = Math.abs(transaction.amount);
      
      if (description.includes('insurance') || description.includes('premium')) {
        categories.insurance.push({ ...transaction, amount });
      } else if (description.includes('mutual fund') || description.includes('elss') || 
                 description.includes('ppf') || description.includes('epf')) {
        categories.investments.push({ ...transaction, amount });
      } else if (description.includes('home loan') || description.includes('housing loan')) {
        categories.homeLoan.push({ ...transaction, amount });
      } else if (description.includes('donation') || description.includes('charity')) {
        categories.donations.push({ ...transaction, amount });
      } else if (description.includes('education') || description.includes('tuition')) {
        categories.education.push({ ...transaction, amount });
      }
    });
    
    return categories;
  }

  findPotential80CDeductions(transactions) {
    let total = 0;
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      if (description.includes('elss') || description.includes('ppf') || 
          description.includes('epf') || description.includes('nps')) {
        total += Math.abs(transaction.amount);
      }
    });
    return total;
  }

  findHealthInsurancePayments(transactions) {
    let total = 0;
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      if (description.includes('health insurance') || description.includes('medical insurance')) {
        total += Math.abs(transaction.amount);
      }
    });
    return total;
  }

  findHomeLoanInterest(transactions) {
    let total = 0;
    transactions.forEach(transaction => {
      const description = transaction.description.toLowerCase();
      if (description.includes('home loan interest') || description.includes('housing loan interest')) {
        total += Math.abs(transaction.amount);
      }
    });
    return total;
  }

  calculateTaxSavings(deductionAmount, income) {
    // Simplified calculation - in reality, this would depend on tax slab
    const taxRate = this.getApplicableTaxRate(income);
    return deductionAmount * (taxRate / 100);
  }

  getApplicableTaxRate(income) {
    if (income <= 500000) return 5;
    if (income <= 1000000) return 20;
    return 30;
  }

  async compareRegimes({ income, deductions }) {
    const oldRegimeTax = await this.calculateTax({
      income,
      deductions,
      regime: 'old',
      financialYear: '2024-25'
    });
    
    const newRegimeTax = await this.calculateTax({
      income,
      deductions: {}, // New regime has limited deductions
      regime: 'new',
      financialYear: '2024-25'
    });
    
    return {
      oldRegime: oldRegimeTax,
      newRegime: newRegimeTax,
      recommendation: oldRegimeTax.totalTax < newRegimeTax.totalTax ? 'old' : 'new',
      savings: Math.abs(oldRegimeTax.totalTax - newRegimeTax.totalTax)
    };
  }

  async getAvailableDeductions() {
    return this.deductionSections;
  }
}

module.exports = new TaxService();
