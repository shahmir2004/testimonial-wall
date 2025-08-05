// test-email-check.js - Test the email check Edge function
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("🔴 Error: Supabase URL or Key is missing in your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailCheck() {
  console.log("🟡 Testing email check Edge function...");
  
  try {
    // Test with an email that might exist
    const testEmail = "test@example.com";
    
    const { data, error } = await supabase.functions.invoke('check-email', {
      body: { email: testEmail }
    });
    
    if (error) {
      console.error("🔴 Edge function error:", error);
      return;
    }
    
    console.log("✅ Edge function working! Response:", data);
    console.log(`Email "${testEmail}" exists: ${data.exists}`);
    
  } catch (error) {
    console.error("🔴 Network error:", error);
  }
}

testEmailCheck();
