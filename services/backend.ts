// Mock Backend Service - Simulates PostgreSQL Database Operations
class TaxWiseBackend {
  private storage: Record<string, any> = {};

  constructor() {
    // Initialize with some mock data
    this.storage = {
      users: {},
      questionnaire_responses: {},
      uploaded_files: {},
      tax_data: {},
      financial_data: {},
      transactions: [],
      credit_data: {},
      alerts: [],
      chat_history: {},
      reports: [],
      itr_filings: [],
      shared_links: []
    };
    
    // Initialize with mock data
    this.initializeMockData();
  }

  // Questionnaire Methods
  async saveQuestionnaireResponse(userId: string, responses: any) {
    console.log('💾 Saving questionnaire response to PostgreSQL:', { userId, responses });
    
    this.storage.questionnaire_responses[userId] = {
      ...responses,
      id: Date.now(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      id: this.storage.questionnaire_responses[userId].id,
      message: 'Questionnaire responses saved successfully'
    };
  }

  async getQuestionnaireResponse(userId: string) {
    console.log('📖 Fetching questionnaire response from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.questionnaire_responses[userId] || null;
  }

  // File Upload Methods
  async uploadFile(file: File, userId: string, category: string = 'general') {
    console.log('📁 Uploading file to PostgreSQL:', { fileName: file.name, size: file.size, category });
    
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileData = {
      id: fileId,
      userId,
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      url: URL.createObjectURL(file), // For preview purposes
      extractedData: null
    };

    this.storage.uploaded_files[fileId] = fileData;

    // Simulate file processing
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

    this.storage.uploaded_files[fileId] = {
      ...fileData,
      status: 'completed',
      extractedData
    };

    console.log('✅ File processing completed:', fileId);

    return {
      success: true,
      fileId,
      extractedData,
      message: 'File uploaded and processed successfully'
    };
  }

  async getUploadedFiles(userId: string) {
    console.log('📂 Fetching uploaded files from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userFiles = Object.values(this.storage.uploaded_files)
      .filter((file: any) => file.userId === userId);
    
    return userFiles;
  }

  async deleteFile(fileId: string) {
    console.log('🗑️ Deleting file from PostgreSQL:', fileId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    delete this.storage.uploaded_files[fileId];
    
    return { success: true, message: 'File deleted successfully' };
  }

  // Financial Data Methods
  async saveFinancialData(userId: string, data: any) {
    console.log('💰 Saving financial data to PostgreSQL:', { userId, data });
    
    this.storage.financial_data[userId] = {
      ...data,
      userId,
      lastUpdated: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 400));
    
    return { success: true, message: 'Financial data saved successfully' };
  }

  async getFinancialData(userId: string) {
    console.log('📊 Fetching financial data from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.financial_data[userId] || null;
  }

  // Tax Data Methods
  async saveTaxData(userId: string, taxData: any) {
    console.log('🧾 Saving tax data to PostgreSQL:', { userId, taxData });
    
    this.storage.tax_data[userId] = {
      ...taxData,
      userId,
      lastUpdated: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Tax data saved successfully' };
  }

  async getTaxData(userId: string) {
    console.log('📋 Fetching tax data from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.storage.tax_data[userId] || null;
  }

  // Credit Data Methods
  async saveCreditData(userId: string, creditData: any) {
    console.log('💳 Saving credit data to PostgreSQL:', { userId, creditData });
    
    this.storage.credit_data[userId] = {
      ...creditData,
      userId,
      lastUpdated: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, message: 'Credit data saved successfully' };
  }

  async getCreditData(userId: string) {
    console.log('📈 Fetching credit data from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.credit_data[userId] || null;
  }

  // Transaction Methods
  async saveTransaction(userId: string, transaction: any) {
    console.log('💸 Saving transaction to PostgreSQL:', { userId, transaction });
    
    const transactionData = {
      ...transaction,
      id: Date.now(),
      userId,
      createdAt: new Date().toISOString()
    };

    this.storage.transactions.push(transactionData);

    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, transactionId: transactionData.id };
  }

  async getTransactions(userId: string) {
    console.log('🔍 Fetching transactions from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.transactions.filter(t => t.userId === userId);
  }

  // Chat History Methods
  async saveChatMessage(userId: string, message: any) {
    console.log('💬 Saving chat message to PostgreSQL:', { userId, message });
    
    if (!this.storage.chat_history[userId]) {
      this.storage.chat_history[userId] = [];
    }

    const messageData = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    this.storage.chat_history[userId].push(messageData);

    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, messageId: messageData.id };
  }

  async getChatHistory(userId: string) {
    console.log('💭 Fetching chat history from PostgreSQL:', userId);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.chat_history[userId] || [];
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

  // Export Methods
  async generateReport(userId: string, reportType: string) {
    console.log('📄 Generating report from PostgreSQL data:', { userId, reportType });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock report generation
    const reportData = {
      id: `report_${Date.now()}`,
      userId,
      type: reportType,
      generatedAt: new Date().toISOString(),
      downloadUrl: `#download-${reportType}-${Date.now()}`,
      format: 'PDF'
    };

    return {
      success: true,
      report: reportData,
      message: 'Report generated successfully'
    };
  }

  // User Authentication Methods
  async login(credentials: { email: string; password: string }) {
    console.log('🔐 Processing login request:', credentials.email);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock authentication - in real app, this would verify against database
    if (credentials.email && credentials.password) {
      const user = {
        id: 'user_demo_123',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        loginAt: new Date().toISOString(),
        isActive: true
      };
      
      this.storage.users[user.id] = user;
      
      return {
        success: true,
        user,
        token: `mock_token_${Date.now()}`,
        message: 'Login successful'
      };
    }
    
    throw new Error('Invalid credentials');
  }

  async logout(userId: string) {
    console.log('🚪 Processing logout for user:', userId);
    
    if (this.storage.users[userId]) {
      this.storage.users[userId].isActive = false;
      this.storage.users[userId].logoutAt = new Date().toISOString();
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true, message: 'Logged out successfully' };
  }

  async updateProfile(userId: string, profileData: any) {
    console.log('👤 Updating profile for user:', userId);
    
    if (this.storage.users[userId]) {
      this.storage.users[userId] = {
        ...this.storage.users[userId],
        ...profileData,
        updatedAt: new Date().toISOString()
      };
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      user: this.storage.users[userId],
      message: 'Profile updated successfully'
    };
  }

  // Reports and Downloads Methods
  async saveReport(userId: string, reportData: any) {
    console.log('📊 Saving report to PostgreSQL:', { userId, reportData });
    
    if (!this.storage.reports) {
      this.storage.reports = [];
    }
    
    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...reportData,
      createdAt: new Date().toISOString(),
      downloadUrl: `#download-${reportData.type}-${Date.now()}`
    };
    
    this.storage.reports.push(report);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      success: true,
      report,
      message: 'Report generated and saved successfully'
    };
  }

  async getReports(userId: string) {
    console.log('📋 Fetching reports from PostgreSQL:', userId);
    
    if (!this.storage.reports) {
      this.storage.reports = [];
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.reports.filter(r => r.userId === userId);
  }

  // Alerts Methods
  async saveAlert(userId: string, alertData: any) {
    console.log('🔔 Saving alert to PostgreSQL:', { userId, alertData });
    
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...alertData,
      createdAt: new Date().toISOString(),
      status: alertData.status || 'active'
    };
    
    this.storage.alerts.push(alert);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      alert,
      message: 'Alert saved successfully'
    };
  }

  async updateAlert(alertId: string, updates: any) {
    console.log('🔄 Updating alert in PostgreSQL:', { alertId, updates });
    
    const alertIndex = this.storage.alerts.findIndex(a => a.id === alertId);
    if (alertIndex !== -1) {
      this.storage.alerts[alertIndex] = {
        ...this.storage.alerts[alertIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      alert: this.storage.alerts[alertIndex],
      message: 'Alert updated successfully'
    };
  }

  async getAlerts(userId: string) {
    console.log('🔍 Fetching alerts from PostgreSQL:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return this.storage.alerts.filter(a => a.userId === userId);
  }

  // ITR Filing Methods
  async saveITRData(userId: string, itrData: any) {
    console.log('📄 Saving ITR data to PostgreSQL:', { userId, itrData });
    
    if (!this.storage.itr_filings) {
      this.storage.itr_filings = [];
    }
    
    const filing = {
      id: `itr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...itrData,
      filedAt: new Date().toISOString(),
      status: 'filed'
    };
    
    this.storage.itr_filings.push(filing);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      filing,
      message: 'ITR filed successfully'
    };
  }

  // Sharing Methods
  async saveSharedLink(userId: string, shareData: any) {
    console.log('🔗 Saving shared link to PostgreSQL:', { userId, shareData });
    
    if (!this.storage.shared_links) {
      this.storage.shared_links = [];
    }
    
    const sharedLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      ...shareData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      accessCount: 0
    };
    
    this.storage.shared_links.push(sharedLink);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      link: `https://taxwise.app/shared/${sharedLink.id}`,
      shareData: sharedLink,
      message: 'Sharing link generated successfully'
    };
  }

  // Mock data for initialization
  initializeMockData() {
    // Add some sample alerts
    this.storage.alerts = [
      {
        id: 'alert_1',
        userId: 'user_demo_123',
        type: 'payment_due',
        title: 'Income Tax Payment Due',
        message: 'Your quarterly advance tax payment of ₹15,000 is due on March 15th',
        amount: 15000,
        dueDate: '2024-03-15',
        status: 'active',
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        id: 'alert_2',
        userId: 'user_demo_123',
        type: 'document_reminder',
        title: 'Upload Investment Proofs',
        message: 'Upload your 80C investment documents to maximize tax savings',
        status: 'active',
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        id: 'alert_3',
        userId: 'user_demo_123',
        type: 'credit_improvement',
        title: 'Credit Score Updated',
        message: 'Your CIBIL score improved by 15 points to 785',
        status: 'completed',
        priority: 'low',
        createdAt: new Date().toISOString()
      }
    ];

    // Add sample reports
    this.storage.reports = [
      {
        id: 'report_1',
        userId: 'user_demo_123',
        type: 'tax_plan',
        title: 'Annual Tax Planning Report',
        format: 'PDF',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        downloadUrl: '#download-tax-plan-report'
      }
    ];

    // Initialize other collections
    this.storage.itr_filings = [];
    this.storage.shared_links = [];
  }

  // Debug method to view all data
  debugViewAllData() {
    console.log('🔍 Current Backend Storage:', this.storage);
    return this.storage;
  }

  // Get all database tables for Mock Backend visualization
  getAllTables() {
    return {
      users: Object.values(this.storage.users || {}),
      questionnaire_responses: Object.values(this.storage.questionnaire_responses || {}),
      uploaded_files: Object.values(this.storage.uploaded_files || {}),
      transactions: this.storage.transactions || [],
      financial_data: Object.values(this.storage.financial_data || {}),
      tax_data: Object.values(this.storage.tax_data || {}),
      credit_data: Object.values(this.storage.credit_data || {}),
      alerts: this.storage.alerts || [],
      chat_history: Object.values(this.storage.chat_history || {}),
      reports: this.storage.reports || [],
      itr_filings: this.storage.itr_filings || [],
      shared_links: this.storage.shared_links || []
    };
  }
}

// Create singleton instance
const taxWiseBackend = new TaxWiseBackend();

export default taxWiseBackend;
export { TaxWiseBackend };