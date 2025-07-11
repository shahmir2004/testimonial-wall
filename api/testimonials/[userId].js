// api/testimonials/[userId].js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- THIS IS THE CRUCIAL PART ---
// A robust helper to set all necessary CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Allow GET and preflight OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Specify allowed headers
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Allow credentials if needed later
};

export default async function handler(req, res) {
  // Set CORS headers on EVERY response
  setCorsHeaders(res);

  // Explicitly handle the preflight OPTIONS request and end it immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end(); // Use 204 No Content for OPTIONS response
    return;
  }

  // --- The rest of your logic ---
  const { userId } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).end('Method Not Allowed');
  }

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('author_name, author_title, author_avatar_url, testimonial_text')
      .eq('user_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Throw the error to be caught by the catch block
      throw error;
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Even on error, send CORS headers
    // setCorsHeaders(res); // Already set at the top
    return res.status(500).json({ error: 'Failed to fetch testimonials.', details: error.message });
  }
}