export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile?: {
    dateOfBirth?: string;
    panNumber?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    employment?: {
      type: 'salaried' | 'self_employed' | 'business';
      company?: string;
      designation?: string;
    };
  };
  financialProfile?: {
    annualIncome?: number;
    taxRegime: 'old' | 'new';
    cibilScore?: number;
    riskProfile: 'conservative' | 'moderate' | 'aggressive';
  };
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'credit' | 'debit';
  isRecurring: boolean;
  processedAt?: string;
}

export interface TaxCalculation {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  tax: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  regime: 'old' | 'new';
  financialYear: string;
}

export interface TaxOptimization {
  suggestions: TaxSuggestion[];
  totalPotentialSavings: number;
  analysis: any;
}

export interface TaxSuggestion {
  section: string;
  currentAmount: number;
  potentialAmount: number;
  description: string;
  savings: number;
}

export interface CibilAnalysis {
  currentScore: number;
  factors: {
    paymentHistory: any;
    creditUtilization: any;
    creditAge: any;
    creditMix: any;
    newCredit: any;
  };
  recommendations: CibilRecommendation[];
  riskFactors: any[];
  strengths: any[];
}

export interface CibilRecommendation {
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  impact: string;
  timeline: string;
}

export interface DashboardOverview {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  savingsRate: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
  }>;
  period: string;
  lastUpdated: string;
}

export interface FinancialInsight {
  type: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  actionable: boolean;
  category: string;
}

export interface SpendingBreakdown {
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  totalSpending: number;
  period: string;
  chartData: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
