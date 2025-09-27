import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Use environment variables in production, fallback to constructed URL
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, publicAnonKey);

export default supabase;