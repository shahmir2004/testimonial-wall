// api/testimonials/[userId].js
import { createClient } from '@supabase/supabase-js';

// It's secure to expose these on the server-side.
// We're creating a new client here to ensure we are using the public anon key.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to set CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or your specific domain for production
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};


export default async function handler(req, res) {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(200).end();
    return;
  }

  setCorsHeaders(res); // Set CORS headers for the GET request

  // Get the user ID from the dynamic route parameter
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('author_name, author_title, author_avatar_url, testimonial_text')
      .eq('user_id', userId)
      .eq('is_published', true) // Only fetch published testimonials (enforced by RLS too)
      .order('display_order', { ascending: true, nullsFirst: false }) // Order them if display_order is set
      .order('created_at', { ascending: false }); // Fallback ordering

    if (error) {
      throw error;
    }

    // Return the testimonials as JSON
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials.', details: error.message });
  }
}