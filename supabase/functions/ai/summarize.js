// supabase/functions/ai/summarize.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';
import { corsHeaders } from '../_shared/cors.ts';

console.log("AI Summarize function initializing...");

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIKey || !supabaseUrl || !supabaseAnonKey) {
      throw new Error('Server Config Error: Missing required environment variables.');
    }

    // Authenticate the user from the incoming request headers
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized: Invalid user token.");
    }
    
    // Get the testimonial text from the request body
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      throw new Error('A valid testimonial text is required.');
    }
    
    // Call the OpenAI API
    const openai = new OpenAI({ apiKey: openAIKey });
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

    // Return the successful response
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in ai/summarize function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500, // Use 401 for auth errors specifically if you want
    });
  }
});