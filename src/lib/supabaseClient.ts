/**
 * Device-aware Supabase Client
 * 
 * This client wrapper adds the x-device-id header to all requests,
 * enabling device-based isolation at the database level via RLS policies.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { getDemoScopeId } from './demoScope';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Supabase client with device-id header for RLS enforcement
 * Use this client instead of the auto-generated one for device isolation
 */
export const supabaseWithDevice = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-device-id': getDemoScopeId(),
      },
    },
  }
);
