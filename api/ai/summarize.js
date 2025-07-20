// api/ai/summarize.js
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// --- Reusable CORS Headers ---
// This explicitly tells the browser which origins, methods, and headers are allowed.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allows all origins, good for dev and public APIs.
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // This function only accepts POST and OPTIONS.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function handler(req, res) {
  // --- Step 1: Handle the CORS Preflight OPTIONS Request ---
  // The browser sends this automatically before the actual POST request.
  // We must respond with a 2xx status and the correct headers.
  if (req.method === 'OPTIONS') {
    // Note: Vercel's wrapper might handle some of this, but being explicit is safest.
    // We send a 204 No Content response, which is standard for preflights.
    return new Response('ok', { headers: corsHeaders });
  }

  // --- Step 2: Main Function Logic (for POST requests) ---
  try {
    // Ensure environment variables are available
    const { OPENAI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = process.env;
    if (!OPENAI_API_KEY || !VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
      throw new Error('Server configuration error: Missing environment variables.');
    }

    // Authenticate the user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.split(' ')[1];
    const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid token.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate request body
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'A valid testimonial text is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Call OpenAI API
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a marketing assistant. Summarize a customer testimonial into one punchy, positive sentence. Focus on the core benefit or emotion. Do not add any extra text or quotation marks, just the summarized sentence." },
        { role: "user", content: `Please summarize this testimonial: "${text}"` }
      ],
      temperature: 0.7,
      max_tokens: 60,
    });

    const summary = completion.choices[0].message.content.trim();
    
    // Return successful response
    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in ai/summarize function:", error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}