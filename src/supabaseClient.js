// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase URL and Anon Key are missing. Make sure you have a .env file in your project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
    alert(errorMessage);
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);