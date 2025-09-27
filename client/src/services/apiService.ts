import axios from 'axios';
import { ApiResponse, Transaction, TaxCalculation, CibilAnalysis, DashboardOverview, FinancialInsight, SpendingBreakdown } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Upload services
  async uploadBankStatement(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/bank-statement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Transaction services
  async getTransactions(params?: any): Promise<ApiResponse<{ transactions: Transaction[]; pagination: any }>> {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async categorizeTransactions(transactions: Transaction[]): Promise<ApiResponse<Transaction[]>> {
    const response = await api.post('/transactions/categorize', { transactions });
    return response.data;
  },

  async getSpendingAnalysis(period: string = 'month'): Promise<ApiResponse<SpendingBreakdown>> {
    const response = await api.get('/transactions/analysis', { params: { period } });
    return response.data;
  },

  // Tax services
  async calculateTax(taxData: any): Promise<ApiResponse<TaxCalculation>> {
    const response = await api.post('/tax/calculate', taxData);
    return response.data;
  },

  async optimizeTax(optimizationData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/tax/optimize', optimizationData);
    return response.data;
  },

  async compareRegimes(regimeData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/tax/compare-regimes', regimeData);
    return response.data;
  },

  async getDeductions(): Promise<ApiResponse<any>> {
    const response = await api.get('/tax/deductions');
    return response.data;
  },

  // CIBIL services
  async analyzeCibil(analysisData: any): Promise<ApiResponse<CibilAnalysis>> {
    const response = await api.post('/cibil/analyze', analysisData);
    return response.data;
  },

  async getCibilRecommendations(recommendationData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/cibil/recommendations', recommendationData);
    return response.data;
  },

  async simulateCibilScenarios(simulationData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/cibil/simulate', simulationData);
    return response.data;
  },

  async getCibilHealthReport(healthData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/cibil/health-report', healthData);
    return response.data;
  },

  // Dashboard services
  async getDashboardOverview(period: string = 'month'): Promise<ApiResponse<DashboardOverview>> {
    const response = await api.get('/dashboard/overview', { params: { period } });
    return response.data;
  },

  async getFinancialInsights(): Promise<ApiResponse<FinancialInsight[]>> {
    const response = await api.get('/dashboard/insights');
    return response.data;
  },

  async getSpendingBreakdown(period: string = 'month'): Promise<ApiResponse<SpendingBreakdown>> {
    const response = await api.get('/dashboard/spending-breakdown', { params: { period } });
    return response.data;
  },

  async getTaxProjection(regime: string = 'new'): Promise<ApiResponse<any>> {
    const response = await api.get('/dashboard/tax-projection', { params: { regime } });
    return response.data;
  },

  async getCibilHealth(): Promise<ApiResponse<any>> {
    const response = await api.get('/dashboard/cibil-health');
    return response.data;
  },

  async generateReport(reportData: any): Promise<ApiResponse<any>> {
    const response = await api.post('/dashboard/generate-report', reportData);
    return response.data;
  }
};
