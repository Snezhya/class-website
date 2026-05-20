import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'WARNING: Supabase URL or Anon Key is missing. Ensure you have copied .env.example to .env and configured the keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
