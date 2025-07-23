// api/ai/summarize.js
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

if(process.env.NODE_ENV !== 'production') {
  const envPath = path.resolve(process.cwd(), '.env.local');
  dotenv.config({ path: envPath });
}
console.log("Environment variables loaded:", process.env);

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
    // --- LOOK FOR UNIQUE TSW_ PREFIXED VARIABLES ---
    const hfApiKey = process.env.TSW_HUGGINGFACE_API_KEY;
    const supabaseUrl = process.env.TSW_SUPABASE_URL;
    const supabaseKey = process.env.TSW_SUPABASE_ANON_KEY;

    // Explicitly check each one for clear debugging
   if (!hfApiKey) {
      throw new Error('Server Config Error: Missing Hugging Face API Key.');
    }
    if (!supabaseUrl) throw new Error('Server Config Error: Missing TSW_SUPABASE_URL.');
    if (!supabaseKey) throw new Error('Server Config Error: Missing TSW_SUPABASE_ANON_KEY.');

    // 1. Authenticate the user
      const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing authorization token.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.split(' ')[1];
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optional: Check if user is on a Pro plan (you would uncomment this after implementing payments)
    // const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
    // if (profile?.plan !== 'pro') {
    //   return new Response(JSON.stringify({ error: 'Forbidden: AI features require a Pro plan.' }), {
    //     status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   });
    // }

    // 4. Validate the incoming request body from the frontend.
     const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
      {
        headers: {
          "Authorization": `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: text,
          parameters: { // Optional: control the output
            min_length: 10,
            max_length: 50,
          }
        }),
      }
    );
    
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to get summary from Hugging Face.');
    }

    const summary = result[0].summary_text; // The structure of the response

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // 7. Catch any unexpected errors and return a generic 500 error.
    console.error("Critical Error in ai/summarize function:", error);
    return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}