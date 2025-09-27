import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify authentication
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { error: 'Invalid access token', user: null };
    }
    
    return { error: null, user };
  } catch (err) {
    console.log('Auth verification error:', err);
    return { error: 'Auth verification failed', user: null };
  }
}

// Health check endpoint
app.get("/make-server-76b9cb10/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    supabase_url: Deno.env.get('SUPABASE_URL') ? 'configured' : 'missing',
    service_key: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'configured' : 'missing'
  });
});

// Test endpoint for debugging
app.post("/make-server-76b9cb10/test", async (c) => {
  try {
    const body = await c.req.json();
    console.log('🧪 Test endpoint called with:', body);
    return c.json({ success: true, received: body, timestamp: new Date().toISOString() });
  } catch (error) {
    console.log('❌ Test endpoint error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ==================== AUTH ENDPOINTS ====================

// Sign up endpoint
app.post("/make-server-76b9cb10/auth/signup", async (c) => {
  try {
    console.log('🔄 Signup request received');
    const body = await c.req.json();
    const { email, password, name } = body;

    console.log('📝 Signup data:', { email, name, passwordLength: password?.length });

    if (!email || !password || !name) {
      console.log('❌ Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    console.log('🔐 Creating user with Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('❌ Supabase Auth signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('✅ User created in Supabase Auth:', data.user.id);

    // Store additional user data in KV store
    try {
      await kv.set(`user:${data.user.id}`, {
        id: data.user.id,
        email: data.user.email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log('✅ User data saved to KV store');
    } catch (kvError) {
      console.log('⚠️ KV store error (non-critical):', kvError);
    }

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.log('❌ Signup endpoint error:', error);
    return c.json({ error: 'Signup failed: ' + error.message }, 500);
  }
});

// ==================== USER DATA ENDPOINTS ====================

// Save questionnaire response
app.post("/make-server-76b9cb10/questionnaire", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const responses = await c.req.json();
    
    const questionnaireData = {
      ...responses,
      id: Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`questionnaire:${user.id}`, questionnaireData);

    return c.json({
      success: true,
      id: questionnaireData.id,
      message: 'Questionnaire responses saved successfully'
    });

  } catch (error) {
    console.log('Save questionnaire error:', error);
    return c.json({ error: 'Failed to save questionnaire' }, 500);
  }
});

// Get questionnaire response
app.get("/make-server-76b9cb10/questionnaire", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const questionnaireData = await kv.get(`questionnaire:${user.id}`);
    return c.json(questionnaireData || null);

  } catch (error) {
    console.log('Get questionnaire error:', error);
    return c.json({ error: 'Failed to fetch questionnaire' }, 500);
  }
});

// ==================== FILE UPLOAD ENDPOINTS ====================

// Upload file endpoint
app.post("/make-server-76b9cb10/upload", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileData = {
      id: fileId,
      userId: user.id,
      name: file.name,
      size: file.size,
      type: file.type,
      category,
      uploadedAt: new Date().toISOString(),
      status: 'completed',
      extractedData: mockExtractFileData(file)
    };

    await kv.set(`file:${fileId}`, fileData);

    // Also maintain a list of user files
    const userFiles = await kv.get(`user_files:${user.id}`) || [];
    userFiles.push(fileId);
    await kv.set(`user_files:${user.id}`, userFiles);

    return c.json({
      success: true,
      fileId,
      extractedData: fileData.extractedData,
      message: 'File uploaded and processed successfully'
    });

  } catch (error) {
    console.log('Upload file error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Get uploaded files
app.get("/make-server-76b9cb10/files", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userFileIds = await kv.get(`user_files:${user.id}`) || [];
    const files = [];

    for (const fileId of userFileIds) {
      const fileData = await kv.get(`file:${fileId}`);
      if (fileData) {
        files.push(fileData);
      }
    }

    return c.json({ files });

  } catch (error) {
    console.log('Get files error:', error);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// Delete file
app.delete("/make-server-76b9cb10/files/:fileId", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const fileId = c.req.param('fileId');
    
    // Remove from KV store
    await kv.del(`file:${fileId}`);
    
    // Remove from user's file list
    const userFiles = await kv.get(`user_files:${user.id}`) || [];
    const updatedFiles = userFiles.filter(id => id !== fileId);
    await kv.set(`user_files:${user.id}`, updatedFiles);

    return c.json({ success: true, message: 'File deleted successfully' });

  } catch (error) {
    console.log('Delete file error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// ==================== FINANCIAL DATA ENDPOINTS ====================

// Save financial data
app.post("/make-server-76b9cb10/financial-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const data = await c.req.json();
    
    const financialData = {
      ...data,
      userId: user.id,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`financial_data:${user.id}`, financialData);

    return c.json({ success: true, message: 'Financial data saved successfully' });

  } catch (error) {
    console.log('Save financial data error:', error);
    return c.json({ error: 'Failed to save financial data' }, 500);
  }
});

// Get financial data
app.get("/make-server-76b9cb10/financial-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const financialData = await kv.get(`financial_data:${user.id}`);
    return c.json({ data: financialData || null });

  } catch (error) {
    console.log('Get financial data error:', error);
    return c.json({ error: 'Failed to fetch financial data' }, 500);
  }
});

// ==================== TAX DATA ENDPOINTS ====================

// Save tax data
app.post("/make-server-76b9cb10/tax-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taxData = await c.req.json();
    
    const data = {
      ...taxData,
      userId: user.id,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`tax_data:${user.id}`, data);

    return c.json({ success: true, message: 'Tax data saved successfully' });

  } catch (error) {
    console.log('Save tax data error:', error);
    return c.json({ error: 'Failed to save tax data' }, 500);
  }
});

// Get tax data
app.get("/make-server-76b9cb10/tax-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taxData = await kv.get(`tax_data:${user.id}`);
    return c.json(taxData || null);

  } catch (error) {
    console.log('Get tax data error:', error);
    return c.json({ error: 'Failed to fetch tax data' }, 500);
  }
});

// ==================== CREDIT DATA ENDPOINTS ====================

// Save credit data
app.post("/make-server-76b9cb10/credit-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const creditData = await c.req.json();
    
    const data = {
      ...creditData,
      userId: user.id,
      lastUpdated: new Date().toISOString()
    };

    await kv.set(`credit_data:${user.id}`, data);

    return c.json({ success: true, message: 'Credit data saved successfully' });

  } catch (error) {
    console.log('Save credit data error:', error);
    return c.json({ error: 'Failed to save credit data' }, 500);
  }
});

// Get credit data
app.get("/make-server-76b9cb10/credit-data", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const creditData = await kv.get(`credit_data:${user.id}`);
    return c.json(creditData || null);

  } catch (error) {
    console.log('Get credit data error:', error);
    return c.json({ error: 'Failed to fetch credit data' }, 500);
  }
});

// ==================== TRANSACTION ENDPOINTS ====================

// Save transaction
app.post("/make-server-76b9cb10/transactions", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transaction = await c.req.json();
    
    const transactionData = {
      ...transaction,
      id: Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    // Get existing transactions
    const userTransactions = await kv.get(`transactions:${user.id}`) || [];
    userTransactions.push(transactionData);
    
    await kv.set(`transactions:${user.id}`, userTransactions);

    return c.json({ success: true, transactionId: transactionData.id });

  } catch (error) {
    console.log('Save transaction error:', error);
    return c.json({ error: 'Failed to save transaction' }, 500);
  }
});

// Get transactions
app.get("/make-server-76b9cb10/transactions", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactions = await kv.get(`transactions:${user.id}`) || [];
    return c.json(transactions);

  } catch (error) {
    console.log('Get transactions error:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

// ==================== CHAT ENDPOINTS ====================

// Save chat message
app.post("/make-server-76b9cb10/chat", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const message = await c.req.json();
    
    const messageData = {
      ...message,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };

    // Get existing chat history
    const chatHistory = await kv.get(`chat:${user.id}`) || [];
    chatHistory.push(messageData);
    
    await kv.set(`chat:${user.id}`, chatHistory);

    return c.json({ success: true, messageId: messageData.id });

  } catch (error) {
    console.log('Save chat message error:', error);
    return c.json({ error: 'Failed to save chat message' }, 500);
  }
});

// Get chat history
app.get("/make-server-76b9cb10/chat", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const chatHistory = await kv.get(`chat:${user.id}`) || [];
    return c.json(chatHistory);

  } catch (error) {
    console.log('Get chat history error:', error);
    return c.json({ error: 'Failed to fetch chat history' }, 500);
  }
});

// ==================== REPORTS ENDPOINTS ====================

// Generate report
app.post("/make-server-76b9cb10/reports", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reportType } = await c.req.json();
    
    const reportData = {
      id: `report_${Date.now()}`,
      userId: user.id,
      type: reportType,
      generatedAt: new Date().toISOString(),
      downloadUrl: `#download-${reportType}-${Date.now()}`,
      format: 'PDF'
    };

    // Get existing reports
    const userReports = await kv.get(`reports:${user.id}`) || [];
    userReports.push(reportData);
    
    await kv.set(`reports:${user.id}`, userReports);

    return c.json({
      success: true,
      report: reportData,
      message: 'Report generated successfully'
    });

  } catch (error) {
    console.log('Generate report error:', error);
    return c.json({ error: 'Failed to generate report' }, 500);
  }
});

// Get reports
app.get("/make-server-76b9cb10/reports", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reports = await kv.get(`reports:${user.id}`) || [];
    return c.json(reports);

  } catch (error) {
    console.log('Get reports error:', error);
    return c.json({ error: 'Failed to fetch reports' }, 500);
  }
});

// ==================== ALERTS ENDPOINTS ====================

// Save alert
app.post("/make-server-76b9cb10/alerts", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const alertData = await c.req.json();
    
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      ...alertData,
      createdAt: new Date().toISOString(),
      status: alertData.status || 'active'
    };

    // Get existing alerts
    const userAlerts = await kv.get(`alerts:${user.id}`) || [];
    userAlerts.push(alert);
    
    await kv.set(`alerts:${user.id}`, userAlerts);

    return c.json({
      success: true,
      alert,
      message: 'Alert saved successfully'
    });

  } catch (error) {
    console.log('Save alert error:', error);
    return c.json({ error: 'Failed to save alert' }, 500);
  }
});

// Get alerts
app.get("/make-server-76b9cb10/alerts", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const alerts = await kv.get(`alerts:${user.id}`) || [];
    return c.json(alerts);

  } catch (error) {
    console.log('Get alerts error:', error);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

// Update alert
app.put("/make-server-76b9cb10/alerts/:alertId", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const alertId = c.req.param('alertId');
    const updates = await c.req.json();
    
    const userAlerts = await kv.get(`alerts:${user.id}`) || [];
    const alertIndex = userAlerts.findIndex(a => a.id === alertId);
    
    if (alertIndex !== -1) {
      userAlerts[alertIndex] = {
        ...userAlerts[alertIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await kv.set(`alerts:${user.id}`, userAlerts);
      
      return c.json({
        success: true,
        alert: userAlerts[alertIndex],
        message: 'Alert updated successfully'
      });
    }

    return c.json({ error: 'Alert not found' }, 404);

  } catch (error) {
    console.log('Update alert error:', error);
    return c.json({ error: 'Failed to update alert' }, 500);
  }
});

// ==================== ITR FILING ENDPOINTS ====================

// Save ITR data
app.post("/make-server-76b9cb10/itr", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const itrData = await c.req.json();
    
    const filing = {
      id: `itr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      ...itrData,
      filedAt: new Date().toISOString(),
      status: 'filed'
    };

    // Get existing ITR filings
    const userFilings = await kv.get(`itr_filings:${user.id}`) || [];
    userFilings.push(filing);
    
    await kv.set(`itr_filings:${user.id}`, userFilings);

    return c.json({
      success: true,
      filing,
      message: 'ITR filed successfully'
    });

  } catch (error) {
    console.log('Save ITR data error:', error);
    return c.json({ error: 'Failed to file ITR' }, 500);
  }
});

// ==================== USER PREFERENCES ENDPOINTS ====================

// Save user preferences
app.post("/make-server-76b9cb10/user/preferences", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const preferences = await c.req.json();
    
    const userPreferences = {
      userId: user.id,
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user_preferences:${user.id}`, userPreferences);

    return c.json({
      success: true,
      preferences: userPreferences,
      message: 'User preferences saved successfully'
    });

  } catch (error) {
    console.log('Save user preferences error:', error);
    return c.json({ error: 'Failed to save user preferences' }, 500);
  }
});

// Get user preferences
app.get("/make-server-76b9cb10/user/preferences", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const preferences = await kv.get(`user_preferences:${user.id}`);
    return c.json(preferences || null);

  } catch (error) {
    console.log('Get user preferences error:', error);
    return c.json({ error: 'Failed to fetch user preferences' }, 500);
  }
});

// Update user profile
app.put("/make-server-76b9cb10/user/profile", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    
    // Update in KV store
    const existingUser = await kv.get(`user:${user.id}`) || {};
    const updatedUser = {
      ...existingUser,
      ...profileData,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedUser);

    return c.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.log('Update user profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ==================== SHARING ENDPOINTS ====================

// Create shared link
app.post("/make-server-76b9cb10/share", async (c) => {
  try {
    const { error: authError, user } = await verifyAuth(c.req);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const shareData = await c.req.json();
    
    const sharedLink = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      ...shareData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      accessCount: 0
    };

    // Get existing shared links
    const userSharedLinks = await kv.get(`shared_links:${user.id}`) || [];
    userSharedLinks.push(sharedLink);
    
    await kv.set(`shared_links:${user.id}`, userSharedLinks);

    return c.json({
      success: true,
      link: `https://taxwise.app/shared/${sharedLink.id}`,
      shareData: sharedLink,
      message: 'Sharing link generated successfully'
    });

  } catch (error) {
    console.log('Create shared link error:', error);
    return c.json({ error: 'Failed to create shared link' }, 500);
  }
});

// ==================== HELPER FUNCTIONS ====================

function mockExtractFileData(file: File) {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.csv')) {
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
  } else if (fileName.endsWith('.pdf')) {
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
  } else if (file.type.startsWith('image/')) {
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
  
  return null;
}

Deno.serve(app.fetch);