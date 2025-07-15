// supabase/functions/handle-signup/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // We'll create this shared file

// Create a Supabase Admin client. This is essential for server-side operations.
// The service_role key is automatically available in the Edge Function environment.
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // This is needed for CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // --- THE CORE LOGIC: CHECK IF USER EXISTS FIRST ---
    // Use the admin client to look up the user by email.
    const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (lookupError && lookupError.message !== 'User not found') {
        // Handle unexpected errors during lookup
        throw lookupError;
    }

    if (existingUser.user) {
      // If user is found, return a specific error.
      return new Response(JSON.stringify({ error: 'A user with this email address already exists.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409, // 409 Conflict is a good status code for this
      });
    }

    // --- If user does not exist, proceed with creation ---
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // This ensures the confirmation email is sent
    });

    if (createError) {
      throw createError;
    }

    // The database trigger we set up before will automatically create the public.profiles row.
    
    return new Response(JSON.stringify({ message: 'Signup successful! Please check your email for a confirmation link.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});