import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Используем все возможные варианты имен ключей, которые встречаются в Lovable-проектах
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  "";

// Логируем в консоль браузера (F12), чтобы понять, что видит приложение
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("DEBUG: Supabase config is missing!");
  console.log("URL exists:", !!SUPABASE_URL);
  console.log("Key exists:", !!SUPABASE_ANON_KEY);
}

// Создаем клиент с заглушками, чтобы приложение не падало с "белым экраном", 
// а просто выдавало ошибку в консоль при запросе данных
export const supabase = createClient<Database>(
  SUPABASE_URL || 'https://placeholder-url.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
