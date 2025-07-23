import { createClient } from '@supabase/supabase-js';
import { InferenceClient } from "@huggingface/inference";
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local in development (using vercel dev)
if (process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req, res) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- LOCAL DEVELOPMENT WORKAROUND ---
    // The VERCEL_ENV variable is 'development' when running `vercel dev`
    // and 'production' when deployed.
    if (process.env.VERCEL_ENV === 'development') {
      console.log("✅ RUNNING IN LOCAL DEV MODE: Bypassing real Hugging Face API call.");
      // Simulate a 2-second delay to mimic a real API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Return a fake, successful response
      return new Response(JSON.stringify({
        summary: "This is a mocked AI summary for local development."
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- END OF LOCAL DEVELOPMENT WORKAROUND ---


    // --- PRODUCTION LOGIC (This will run on the deployed Vercel site) ---
    const hfApiKey = process.env.TSW_HUGGINGFACE_API_KEY;
    const supabaseUrl = process.env.TSW_SUPABASE_URL;
    const supabaseKey = process.env.TSW_SUPABASE_ANON_KEY;

    if (!hfApiKey || !supabaseUrl || !supabaseKey) {
      throw new Error('Server Config Error: Missing required environment variables in production.');
    }

    // 1. Authenticate the user (remains the same)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) { /* ... */ }
    const jwt = authHeader.split(' ')[1];
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !user) { /* ... */ }

    // 2. Parse and validate the request body (remains the same)
    const body = req.body;
    const text = body ? body.text : undefined;
    if (!text || typeof text !== 'string' || text.trim().length < 10) { /* ... */ }

    // 3. Call the Hugging Face API using the SDK
    const hf = new InferenceClient(hfApiKey);
    const result = await hf.summarization({
      model: "facebook/bart-large-cnn",
      inputs: text,
      parameters: { min_length: 10, max_length: 50 }
    });
    const summary = result.summary_text;
    if (!summary) throw new Error('AI failed to produce a valid summary.');

    // 4. Return Success
    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Critical Error in ai/summarize function:", error);
    if (error.message && error.message.includes('is currently loading')) {
        return new Response(JSON.stringify({ error: `AI model is warming up. Please try again in a moment.` }), {
          status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}