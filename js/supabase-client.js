/* CarCare — shared Supabase client (public anon key, safe to expose; RLS enforces access) */
const SUPABASE_URL = 'https://vkqhenjpltpmnourxrfh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wfwl6144cW5SnwUHCt-NAA_64TmWeiZ';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
