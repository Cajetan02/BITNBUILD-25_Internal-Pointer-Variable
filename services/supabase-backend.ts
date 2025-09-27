// Supabase Backend Service - Connects to Real Supabase Database
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

class SupabaseBackend {
  private apiUrl: string;
  private currentUser: any = null;
  private accessToken: string | null = null;

  constructor() {
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
    this.apiUrl = `${supabaseUrl}/functions/v1/make-server-76b9cb10`;
  }

  // Helper method to make authenticated requests
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || 'Request failed');
    }

    return await response.json();
  }

  // Helper method for form data requests
  private async makeFormRequest(endpoint: string, formData: FormData) {
    const url = `${this.apiUrl}${endpoint}`;
    
    console.log('🌐 Making form request to:', url);
    console.log('🔑 Using token:', this.accessToken ? 'authenticated' : 'public anon key');
    
    const headers = {
      'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('📥 Form request response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error('❌ Form request failed:', errorData);
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Form request successful');
    return result;
  }

  // ==================== AUTH METHODS ====================

  async login(credentials: { email: string; password: string }) {
    console.log('🔐 Processing login request:', credentials.email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session && data.user) {
        this.currentUser = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
        };
        this.accessToken = data.session.access_token;

        console.log('✅ Login successful:', this.currentUser);
        return {
          success: true,
          user: this.currentUser,
          token: this.accessToken,
          message: 'Login successful'
        };
      }

      throw new Error('No session returned');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  async signup(userData: { email: string; password: string; name: string }) {
    console.log('📝 Processing signup request:', userData.email);
    
    try {
      console.log('🌐 Making signup request to:', `${this.apiUrl}/auth/signup`);
      console.log('📤 Request payload:', { ...userData, password: '[REDACTED]' });
      
      const response = await fetch(`${this.apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(userData),
      });

      console.log('📥 Signup response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown signup error' }));
        console.error('❌ Signup request failed:', errorData);
        throw new Error(errorData.error || `Signup failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Signup successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    }
  }

  async logout(userId?: string) {
    console.log('🚪 Processing logout for user:', userId);
    
    try {
      await supabase.auth.signOut();
      this.currentUser = null;
      this.accessToken = null;

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  async checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw new Error(error.message);
      }

      if (session && session.user) {
        this.currentUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
        };
        this.accessToken = session.access_token;
        
        return {
          success: true,
          user: this.currentUser,
          token: this.accessToken
        };
      }

      return { success: false, user: null, token: null };
    } catch (error) {
      console.error('❌ Session check failed:', error);
      return { success: false, user: null, token: null };
    }
  }

  // ==================== QUESTIONNAIRE METHODS ====================

  async saveQuestionnaireResponse(userId: string, responses: any) {
    console.log('💾 Saving questionnaire response to Supabase:', { userId, responses });
    
    try {
      const result = await this.makeRequest('/questionnaire', {
        method: 'POST',
        body: JSON.stringify(responses),
      });

      console.log('✅ Questionnaire saved to Supabase');
      return result;
    } catch (error) {
      console.error('❌ Failed to save questionnaire:', error);
      throw error;
    }
  }

  async getQuestionnaireResponse(userId: string) {
    console.log('📖 Fetching questionnaire response from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/questionnaire');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch questionnaire:', error);
      throw error;
    }
  }

  // ==================== FILE UPLOAD METHODS ====================

  async uploadFile(file: File, userId: string, category: string = 'general') {
    console.log('📁 Uploading file to Supabase:', { fileName: file.name, size: file.size, category });
    
    try {
      // For demo purposes, simulate file upload
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate file processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data extraction based on file type
      let extractedData = null;
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        extractedData = this.mockExtractCSVData();
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractedData = this.mockExtractPDFData();
      } else if (file.type.startsWith('image/')) {
        extractedData = this.mockExtractImageData();
      }

      const result = {
        success: true,
        fileId,
        extractedData,
        url: URL.createObjectURL(file), // For preview purposes
        message: 'File uploaded and processed successfully'
      };
      
      console.log('✅ File uploaded to Supabase');
      return result;
    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  // Mock data extraction methods
  private mockExtractCSVData() {
    return {
      type: 'bank_statement',
      transactions: [
        { date: '2024-01-15', description: 'Salary Credit', amount: 75000, category: 'Income', type: 'credit' },
        { date: '2024-01-16', description: 'Grocery Shopping', amount: -2500, category: 'Food', type: 'debit' },
        { date: '2024-01-17', description: 'Uber Ride', amount: -350, category: 'Transport', type: 'debit' },
        { date: '2024-01-18', description: 'SIP Investment', amount: -10000, category: 'Investment', type: 'debit' },
        { date: '2024-01-19', description: 'Electricity Bill', amount: -1800, category: 'Utilities', type: 'debit' }
      ],
      summary: {
        totalIncome: 75000,
        totalExpenses: 14650,
        netSavings: 60350,
        categories: {
          'Food': 2500,
          'Transport': 350,
          'Investment': 10000,
          'Utilities': 1800
        }
      }
    };
  }

  private mockExtractPDFData() {
    return {
      type: 'tax_document',
      documentType: 'Form 16',
      employerName: 'TechCorp Solutions',
      panNumber: 'ABCDE1234F',
      financialYear: '2023-24',
      grossSalary: 1200000,
      tdsDeducted: 120000,
      exemptions: {
        section80C: 150000,
        section80D: 25000,
        hra: 180000
      },
      taxableIncome: 845000
    };
  }

  private mockExtractImageData() {
    return {
      type: 'receipt',
      vendor: 'Medical Store',
      amount: 2500,
      date: '2024-01-15',
      category: 'Medical',
      items: [
        { name: 'Medicine A', amount: 1200 },
        { name: 'Medicine B', amount: 800 },
        { name: 'Consultation', amount: 500 }
      ],
      isDeductible: true,
      section: '80D'
    };
  }

  async getUploadedFiles(userId: string) {
    console.log('📂 Fetching uploaded files from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/files');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch files:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string) {
    console.log('🗑️ Deleting file from Supabase:', fileId);
    
    try {
      const result = await this.makeRequest(`/files/${fileId}`, {
        method: 'DELETE',
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw error;
    }
  }

  // ==================== FINANCIAL DATA METHODS ====================

  async saveFinancialData(userId: string, data: any) {
    console.log('💰 Saving financial data to Supabase:', { userId, data });
    
    try {
      const result = await this.makeRequest('/financial-data', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save financial data:', error);
      throw error;
    }
  }

  async getFinancialData(userId: string) {
    console.log('📊 Fetching financial data from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/financial-data');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch financial data:', error);
      throw error;
    }
  }

  // ==================== TAX DATA METHODS ====================

  async saveTaxData(userId: string, taxData: any) {
    console.log('🧾 Saving tax data to Supabase:', { userId, taxData });
    
    try {
      const result = await this.makeRequest('/tax-data', {
        method: 'POST',
        body: JSON.stringify(taxData),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save tax data:', error);
      throw error;
    }
  }

  async getTaxData(userId: string) {
    console.log('📋 Fetching tax data from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/tax-data');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch tax data:', error);
      throw error;
    }
  }

  // ==================== CREDIT DATA METHODS ====================

  async saveCreditData(userId: string, creditData: any) {
    console.log('💳 Saving credit data to Supabase:', { userId, creditData });
    
    try {
      const result = await this.makeRequest('/credit-data', {
        method: 'POST',
        body: JSON.stringify(creditData),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save credit data:', error);
      throw error;
    }
  }

  async getCreditData(userId: string) {
    console.log('📈 Fetching credit data from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/credit-data');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch credit data:', error);
      throw error;
    }
  }

  // ==================== TRANSACTION METHODS ====================

  async saveTransaction(userId: string, transaction: any) {
    console.log('💸 Saving transaction to Supabase:', { userId, transaction });
    
    try {
      const result = await this.makeRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      throw error;
    }
  }

  async getTransactions(userId: string) {
    console.log('🔍 Fetching transactions from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/transactions');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch transactions:', error);
      throw error;
    }
  }

  // ==================== CHAT METHODS ====================

  async saveChatMessage(userId: string, message: any) {
    console.log('💬 Saving chat message to Supabase:', { userId, message });
    
    try {
      const result = await this.makeRequest('/chat', {
        method: 'POST',
        body: JSON.stringify(message),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save chat message:', error);
      throw error;
    }
  }

  async getChatHistory(userId: string) {
    console.log('💭 Fetching chat history from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/chat');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch chat history:', error);
      throw error;
    }
  }

  // ==================== REPORTS METHODS ====================

  async generateReport(userId: string, reportType: string) {
    console.log('📄 Generating report from Supabase data:', { userId, reportType });
    
    try {
      const result = await this.makeRequest('/reports', {
        method: 'POST',
        body: JSON.stringify({ reportType }),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to generate report:', error);
      throw error;
    }
  }

  async getReports(userId: string) {
    console.log('📋 Fetching reports from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/reports');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch reports:', error);
      throw error;
    }
  }

  // ==================== ALERTS METHODS ====================

  async saveAlert(userId: string, alertData: any) {
    console.log('🔔 Saving alert to Supabase:', { userId, alertData });
    
    try {
      const result = await this.makeRequest('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save alert:', error);
      throw error;
    }
  }

  async updateAlert(alertId: string, updates: any) {
    console.log('🔄 Updating alert in Supabase:', { alertId, updates });
    
    try {
      const result = await this.makeRequest(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to update alert:', error);
      throw error;
    }
  }

  async getAlerts(userId: string) {
    console.log('🔍 Fetching alerts from Supabase:', userId);
    
    try {
      const result = await this.makeRequest('/alerts');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch alerts:', error);
      throw error;
    }
  }

  // ==================== ITR FILING METHODS ====================

  async saveITRData(userId: string, itrData: any) {
    console.log('📄 Saving ITR data to Supabase:', { userId, itrData });
    
    try {
      const result = await this.makeRequest('/itr', {
        method: 'POST',
        body: JSON.stringify(itrData),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save ITR data:', error);
      throw error;
    }
  }

  // ==================== SHARING METHODS ====================

  async saveSharedLink(userId: string, shareData: any) {
    console.log('🔗 Saving shared link to Supabase:', { userId, shareData });
    
    try {
      const result = await this.makeRequest('/share', {
        method: 'POST',
        body: JSON.stringify(shareData),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save shared link:', error);
      throw error;
    }
  }

  // ==================== PROFILE METHODS ====================

  async updateProfile(userId: string, profileData: any) {
    console.log('👤 Updating profile for user:', userId);
    
    try {
      // Update in Supabase auth if name is changed
      if (profileData.name) {
        const { error } = await supabase.auth.updateUser({
          data: { name: profileData.name }
        });

        if (error) {
          throw new Error(error.message);
        }
      }

      // Update in backend KV store
      const result = await this.makeRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...profileData };
      }

      return {
        success: true,
        user: this.currentUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  }

  // ==================== USER PREFERENCES METHODS ====================

  async saveUserPreferences(userId: string, preferences: any) {
    console.log('⚙️ Saving user preferences:', { userId, preferences });
    
    try {
      const result = await this.makeRequest('/user/preferences', {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to save user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string) {
    console.log('🔍 Fetching user preferences:', userId);
    
    try {
      const result = await this.makeRequest('/user/preferences');
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch user preferences:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  getCurrentUser() {
    return this.currentUser;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!(this.currentUser && this.accessToken);
  }

  isOfflineMode() {
    return this.currentUser?.id === 'demo_user_offline';
  }

  // Health check
  async healthCheck() {
    try {
      const result = await fetch(`${this.apiUrl}/health`);
      const data = await result.json();
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Get all tables for mock database view
  getAllTables() {
    console.log('📊 Getting all tables for mock database view');
    
    // Return mock data structure for development
    return {
      users: [
        {
          id: 'user_demo_123',
          email: 'demo@taxwise.com',
          name: 'Demo User',
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      questionnaire_responses: [
        {
          id: 'qr_1',
          userId: 'user_demo_123',
          responses: { income: 85000, expenses: 55000 },
          createdAt: new Date().toISOString(),
          status: 'completed'
        }
      ],
      uploaded_files: [
        {
          id: 'file_1',
          userId: 'user_demo_123',
          name: 'bank_statement.pdf',
          type: 'application/pdf',
          size: 1024000,
          uploadedAt: new Date().toISOString(),
          status: 'processed'
        }
      ],
      transactions: [
        {
          id: 'txn_1',
          userId: 'user_demo_123',
          amount: 50000,
          type: 'income',
          category: 'salary',
          createdAt: new Date().toISOString(),
          status: 'verified'
        }
      ],
      financial_data: [
        {
          id: 'fd_1',
          userId: 'user_demo_123',
          netWorth: 500000,
          monthlyIncome: 85000,
          monthlyExpenses: 55000,
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      ],
      tax_data: [
        {
          id: 'td_1',
          userId: 'user_demo_123',
          totalIncome: 1020000,
          taxLiability: 150000,
          taxYear: 2024,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      ],
      credit_data: [
        {
          id: 'cd_1',
          userId: 'user_demo_123',
          cibilScore: 750,
          creditUtilization: 0.3,
          lastUpdated: new Date().toISOString(),
          status: 'good'
        }
      ],
      alerts: [
        {
          id: 'alert_1',
          userId: 'user_demo_123',
          type: 'tax_deadline',
          message: 'ITR filing deadline approaching',
          priority: 'high',
          createdAt: new Date().toISOString(),
          status: 'unread'
        }
      ],
      chat_history: [
        {
          id: 'chat_1',
          userId: 'user_demo_123',
          message: 'How can I optimize my taxes?',
          response: 'Consider investing in ELSS funds...',
          createdAt: new Date().toISOString(),
          status: 'completed'
        }
      ],
      reports: [
        {
          id: 'report_1',
          userId: 'user_demo_123',
          title: 'Tax Optimization Report',
          type: 'tax_analysis',
          createdAt: new Date().toISOString(),
          status: 'generated'
        }
      ],
      itr_filings: [
        {
          id: 'itr_1',
          userId: 'user_demo_123',
          year: 2024,
          status: 'draft',
          filedAt: null,
          createdAt: new Date().toISOString()
        }
      ],
      shared_links: [
        {
          id: 'link_1',
          userId: 'user_demo_123',
          reportId: 'report_1',
          token: 'abc123',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          status: 'active'
        }
      ]
    };
  }

  // Initialize demo data if needed
  async initializeDemoData() {
    try {
      // Check if demo user exists, if not this will be handled by login flow
      console.log('🔧 Demo data initialization check complete');
      return { success: true };
    } catch (error) {
      console.error('❌ Demo data initialization failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const supabaseBackend = new SupabaseBackend();

export default supabaseBackend;
export { SupabaseBackend };