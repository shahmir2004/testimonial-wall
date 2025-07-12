// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- DEBUGGING ON VERCEL ---
console.log("Attempting to create Supabase client...");
console.log("VITE_SUPABASE_URL found:", !!supabaseUrl); // `!!` converts the value to a true/false boolean
// For security, let's only log a small part of the key to confirm it's there
console.log("VITE_SUPABASE_ANON_KEY found:", !!supabaseAnonKey, supabaseAnonKey ? `(ends with ...${supabaseAnonKey.slice(-6)})` : '');
// --- END DEBUGGING ---

if (!supabaseUrl || !supabaseAnonKey) {
    // This will now cause the build to fail with a much clearer error message
    console.error("CRITICAL ERROR: Supabase environment variables are missing!");
    throw new Error("Supabase URL and/or Anon Key are not defined. Check Vercel environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);