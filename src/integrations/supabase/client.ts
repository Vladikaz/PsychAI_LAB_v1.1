import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Пытаемся достать URL и Ключ из всех возможных вариантов имен
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "";

// Если ключей нет, мы выводим ошибку в консоль, но НЕ ломаем скрипт
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase Error: Credentials not found. Check Vercel Env Variables.");
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
