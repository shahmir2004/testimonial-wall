// supabase/functions/handle-password-reset/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // --- CORE LOGIC: CHECK IF USER EXISTS ---
    // We use the admin client to see if we can find this user.
    // This is secure because this check happens on the server.
    const { data: user, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (lookupError || !user.user) {
      // USER DOES NOT EXIST.
      // We will STILL return a success message to prevent user enumeration.
      // The difference is, we just won't send an email.
      console.log(`Password reset attempt for non-existent user: ${email}`);
      return new Response(JSON.stringify({ message: 'If an account with this email exists, a password reset link has been sent.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // --- If user EXISTS, proceed to send the reset email ---
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      // IMPORTANT: This must match the route in your React app.
      redirectTo: `${Deno.env.get('SITE_URL')}/update-password`,
    });

    if (resetError) {
      throw resetError;
    }

    return new Response(JSON.stringify({ message: 'If an account with this email exists, a password reset link has been sent.' }), {
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