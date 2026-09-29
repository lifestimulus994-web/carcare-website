/* CarCare — shared Supabase client (public anon key, safe to expose; RLS enforces access) */
const SUPABASE_URL = 'https://swfmaitmlpqpwjwiqxzs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_uMS6uP9Ahh5YY1vdBC-Opg_F9u685fQ';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
