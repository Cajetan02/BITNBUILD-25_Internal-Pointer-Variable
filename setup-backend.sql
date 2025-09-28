-- Supabase Backend Setup Script
-- Run this script in your Supabase SQL editor

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Questionnaire Responses Table
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  responses JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Uploaded Files Table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  category TEXT DEFAULT 'general',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'processing',
  extracted_data JSONB
);

-- 4. Create Financial Data Table
CREATE TABLE IF NOT EXISTS financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Tax Data Table
CREATE TABLE IF NOT EXISTS tax_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tax_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Credit Data Table
CREATE TABLE IF NOT EXISTS credit_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  credit_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  amount DECIMAL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT DEFAULT 'PDF',
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create ITR Filings Table
CREATE TABLE IF NOT EXISTS itr_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  filed_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create Shared Links Table
CREATE TABLE IF NOT EXISTS shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  report_id UUID REFERENCES reports(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE itr_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can access own questionnaire_responses" ON questionnaire_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own uploaded_files" ON uploaded_files FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own financial_data" ON financial_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own tax_data" ON tax_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own credit_data" ON credit_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own alerts" ON alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own chat_history" ON chat_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own reports" ON reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own itr_filings" ON itr_filings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own shared_links" ON shared_links FOR ALL USING (auth.uid() = user_id);

-- Insert sample data for testing
INSERT INTO users (id, email, name) VALUES 
('user_demo_123', 'demo@taxwise.com', 'Demo User')
ON CONFLICT (id) DO NOTHING;

INSERT INTO alerts (user_id, type, title, message, priority, status, amount, due_date) VALUES 
('user_demo_123', 'payment_due', 'Income Tax Payment Due', 'Your quarterly advance tax payment of ₹15,000 is due on March 15th', 'high', 'active', 15000, '2024-03-15'),
('user_demo_123', 'document_reminder', 'Upload Investment Proofs', 'Upload your 80C investment documents to maximize tax savings', 'medium', 'active', NULL, '2024-03-31'),
('user_demo_123', 'credit_improvement', 'Credit Score Updated', 'Your CIBIL score improved by 15 points to 785', 'low', 'completed', NULL, '2024-03-10')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_user_id ON questionnaire_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_user_id ON financial_data(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_data_user_id ON tax_data(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_data_user_id ON credit_data(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_itr_filings_user_id ON itr_filings(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);
