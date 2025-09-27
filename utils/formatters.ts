// Currency and number formatting utilities for Indian market

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols, commas, and extra spaces
  const cleanValue = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// Tax calculation utilities based on Indian tax laws
export const TAX_SLABS_NEW_REGIME = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

export const TAX_SLABS_OLD_REGIME = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

export const calculateTax = (
  income: number, 
  regime: 'old' | 'new', 
  deductions: number = 0
): { tax: number; surcharge: number; cess: number; total: number } => {
  const slabs = regime === 'new' ? TAX_SLABS_NEW_REGIME : TAX_SLABS_OLD_REGIME;
  const taxableIncome = regime === 'old' ? Math.max(0, income - deductions) : income;
  
  let tax = 0;
  for (const slab of slabs) {
    if (taxableIncome > slab.min) {
      const taxableAtThisSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
      tax += (taxableAtThisSlab * slab.rate) / 100;
    }
  }
  
  // Calculate surcharge (varies by income level)
  let surcharge = 0;
  if (taxableIncome > 5000000) {
    surcharge = tax * 0.37; // 37% surcharge for income > 5 cr
  } else if (taxableIncome > 10000000) {
    surcharge = tax * 0.25; // 25% surcharge for income > 1 cr
  } else if (taxableIncome > 5000000) {
    surcharge = tax * 0.15; // 15% surcharge for income > 50 lakh
  } else if (taxableIncome > 1000000) {
    surcharge = tax * 0.10; // 10% surcharge for income > 10 lakh
  }
  
  // Health & Education Cess: 4% on (tax + surcharge)
  const cess = (tax + surcharge) * 0.04;
  
  return {
    tax: Math.round(tax * 100) / 100,
    surcharge: Math.round(surcharge * 100) / 100,
    cess: Math.round(cess * 100) / 100,
    total: Math.round((tax + surcharge + cess) * 100) / 100,
  };
};

// CIBIL Score calculation weights
export const CIBIL_WEIGHTS = {
  paymentHistory: 0.35, // 35%
  creditUtilization: 0.30, // 30%
  creditHistory: 0.15, // 15%
  creditMix: 0.10, // 10%
  newCredit: 0.10, // 10%
};

export const calculateCIBILScore = (factors: {
  paymentHistory: number; // 0-100
  creditUtilization: number; // 0-100 (percentage)
  creditHistoryMonths: number;
  creditMixTypes: number; // number of different credit types
  recentInquiries: number;
}): number => {
  const {
    paymentHistory,
    creditUtilization,
    creditHistoryMonths,
    creditMixTypes,
    recentInquiries
  } = factors;
  
  // Normalize factors to 0-1 scale
  const normalizedPayment = paymentHistory / 100;
  const normalizedUtilization = Math.max(0, (100 - creditUtilization) / 100); // Lower is better
  const normalizedHistory = Math.min(1, creditHistoryMonths / 120); // 10 years max
  const normalizedMix = Math.min(1, creditMixTypes / 5); // 5 types max
  const normalizedInquiries = Math.max(0, (10 - recentInquiries) / 10); // 10 inquiries max
  
  const score = (
    normalizedPayment * CIBIL_WEIGHTS.paymentHistory +
    normalizedUtilization * CIBIL_WEIGHTS.creditUtilization +
    normalizedHistory * CIBIL_WEIGHTS.creditHistory +
    normalizedMix * CIBIL_WEIGHTS.creditMix +
    normalizedInquiries * CIBIL_WEIGHTS.newCredit
  ) * 600 + 300; // Scale to 300-900 range
  
  return Math.round(Math.min(900, Math.max(300, score)));
};