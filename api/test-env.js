// api/test-env.js

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Try to read our unique test variable from process.env
  const mySecret = process.env.MY_TEST_SECRET;

  if (mySecret) {
    // 2. If it exists, send it back with a success message
    const responseBody = JSON.stringify({
      success: true,
      message: "Environment variable loaded successfully!",
      value: mySecret,
    });
    return new Response(responseBody, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } else {
    // 3. If it does NOT exist, send back a clear error message
    const responseBody = JSON.stringify({
      success: false,
      error: "CRITICAL: Failed to load MY_TEST_SECRET from .env.local",
      // Let's also send back the keys of process.env to see what IS there
      availableKeys: Object.keys(process.env),
    });
    return new Response(responseBody, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}