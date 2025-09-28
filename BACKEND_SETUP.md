# Backend Setup Guide

## Overview
This application uses Supabase as the backend service for data storage and authentication. The app is already configured to work with a Supabase project.

## Current Configuration
The app is currently configured with:
- **Project ID**: `zswnntasyipwohmtyzor`
- **Supabase URL**: `https://zswnntasyipwohmtyzor.supabase.co`
- **Anon Key**: Already configured in the codebase

## Environment Variables (Optional)
If you want to use your own Supabase project, create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_ENV=development
```

## Database Schema
The application expects the following tables in your Supabase database:

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Questionnaire Responses
```sql
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  responses JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Uploaded Files
```sql
CREATE TABLE uploaded_files (
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
```

### 4. Financial Data
```sql
CREATE TABLE financial_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Tax Data
```sql
CREATE TABLE tax_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tax_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Credit Data
```sql
CREATE TABLE credit_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  credit_data JSONB NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. Alerts
```sql
CREATE TABLE alerts (
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
```

### 9. Chat History
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 10. Reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  format TEXT DEFAULT 'PDF',
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 11. ITR Filings
```sql
CREATE TABLE itr_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft',
  filed_at TIMESTAMP WITH TIME ZONE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 12. Shared Links
```sql
CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  report_id UUID REFERENCES reports(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  access_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)
Enable RLS on all tables and create policies:

```sql
-- Enable RLS on all tables
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

-- Create policies for users to access only their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Similar policies for other tables
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
```

## Supabase Edge Functions
The application uses Supabase Edge Functions for backend API endpoints. The functions are located in the `supabase/functions/` directory.

### Available Endpoints:
- `POST /auth/signup` - User registration
- `POST /questionnaire` - Save questionnaire responses
- `GET /questionnaire` - Get questionnaire responses
- `POST /files` - Upload files
- `GET /files` - Get uploaded files
- `DELETE /files/:id` - Delete file
- `POST /financial-data` - Save financial data
- `GET /financial-data` - Get financial data
- `POST /tax-data` - Save tax data
- `GET /tax-data` - Get tax data
- `POST /credit-data` - Save credit data
- `GET /credit-data` - Get credit data
- `POST /transactions` - Save transaction
- `GET /transactions` - Get transactions
- `POST /chat` - Save chat message
- `GET /chat` - Get chat history
- `POST /reports` - Generate report
- `GET /reports` - Get reports
- `POST /alerts` - Save alert
- `PUT /alerts/:id` - Update alert
- `GET /alerts` - Get alerts
- `POST /itr` - Save ITR data
- `POST /share` - Create shared link
- `PUT /user/profile` - Update user profile
- `POST /user/preferences` - Save user preferences
- `GET /user/preferences` - Get user preferences
- `GET /health` - Health check

## Deployment
1. Deploy your Supabase project
2. Run the SQL schema creation scripts
3. Set up RLS policies
4. Deploy the Edge Functions
5. Update environment variables if using custom Supabase project

## Testing
The application includes mock data for development and testing. The backend service automatically falls back to mock data when the Supabase connection is not available.

## Support
For issues with the backend setup, check:
1. Supabase project is active
2. Database tables are created
3. RLS policies are set up correctly
4. Edge Functions are deployed
5. Environment variables are correct
