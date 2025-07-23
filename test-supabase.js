// test-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkSupabaseConnection() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("🔴 Error: Supabase URL or Key is missing in your .env.local file.");
    return;
  }
  console.log("🟡 Attempting to connect to Supabase...");
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    // We'll try a simple, public read operation.
    // Let's assume you have a public table or we can just try to list tables.
    // A simple check is to try and get the session.
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("🔴 Connection FAILED. Supabase returned an error:");
      console.error(error);
    } else {
      console.log("✅ SUCCESS! Connection to Supabase is working.");
      console.log("Current session status:", data.session ? "Session exists" : "No session");
    }
  } catch (e) {
    console.error("🔴 FAILED. A network-level error occurred:");
    console.error(e);
  }
}

checkSupabaseConnection();