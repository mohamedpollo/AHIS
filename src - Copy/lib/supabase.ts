import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => {
  const localUrl = localStorage.getItem('VITE_SUPABASE_URL');
  const localKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
  
  const url = import.meta.env.VITE_SUPABASE_URL || localUrl || 'https://placeholder.supabase.co';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localKey || 'placeholder-key';
  
  return { url, key, isPlaceholder: url.includes('placeholder') };
};

const { url, key } = getSupabaseConfig();

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  if (!localStorage.getItem('VITE_SUPABASE_URL')) {
    console.warn('Supabase credentials missing. App will run in limited mode or with mock data if configured.');
  }
}

export const supabase = createClient(url, key);

export const isSupabaseConfigured = () => {
  const { isPlaceholder } = getSupabaseConfig();
  return !isPlaceholder;
};
