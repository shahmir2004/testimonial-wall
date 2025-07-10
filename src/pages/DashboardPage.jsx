// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth(); // Get the current logged-in user
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for new testimonials
  const [authorName, setAuthorName] = useState('');
  const [testimonialText, setTestimonialText] = useState('');

  // Fetch testimonials for the current user
  const fetchTestimonials = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      setError(error.message);
    } else {
      setTestimonials(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, [user]); // Re-fetch if user changes

  // Handle form submission to create a new testimonial
  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !testimonialText.trim()) {
      alert('Author name and testimonial text are required.');
      return;
    }

    const { data, error } = await supabase
      .from('testimonials')
      .insert([{
        author_name: authorName,
        testimonial_text: testimonialText,
        user_id: user.id
      }])
      .select(); // .select() returns the newly created row

    if (error) {
      console.error('Error creating testimonial:', error);
      alert('Failed to create testimonial. Please try again.');
    } else if (data) {
      // Add the new testimonial to the top of the list locally
      setTestimonials([data[0], ...testimonials]);
      // Reset form fields
      setAuthorName('');
      setTestimonialText('');
    }
  };

  // Handle testimonial deletion
  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting testimonial:', error);
      alert('Failed to delete testimonial.');
    } else {
      // Remove the deleted testimonial from the local state
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  if (loading) return <p>Loading your testimonials...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  const embedCode = `<div id="testimonial-wall-container" data-user-id="${user?.id}"></div>\n<script src="${window.location.origin}/testimonial-widget.js" defer></script>`;

  return (
    <div>
      <h2>Your Testimonials Dashboard</h2>
      
      {/* New "Embed Your Wall" Section */}
      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', maxWidth: '600px', backgroundColor: '#2a2a2a' }}>
        <h3>Embed Your "Wall of Love"</h3>
        <p style={{fontSize: '0.9rem', color: '#ccc'}}>Copy this code and paste it into your website's HTML where you want your testimonials to appear.</p>
        <pre style={{
          backgroundColor: '#1a1a1a',
          padding: '1rem',
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          textAlign: 'left',
          cursor: 'pointer'
        }}
        onClick={() => {
          navigator.clipboard.writeText(embedCode);
          alert('Embed code copied to clipboard!');
        }}
        >
          <code>{embedCode}</code>
        </pre>
      </div>

      {/* Form to Add New Testimonial */}
      <div style={{ margin: '2rem auto', padding: '1.5rem', border: '1px solid #444', borderRadius: '8px', maxWidth: '600px' }}>
        <h3>Add a New Testimonial</h3>
        <form onSubmit={handleCreateTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Author's Name (e.g., Jane Doe)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
          <textarea
            placeholder="Testimonial text..."
            value={testimonialText}
            onChange={(e) => setTestimonialText(e.target.value)}
            rows="4"
            required
          />
          <button type="submit">Add Testimonial</button>
        </form>
      </div>

      {/* List of Existing Testimonials */}
      <h3>Your Collection</h3>
      {testimonials.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {testimonials.map(testimonial => (
            <div key={testimonial.id} style={{ border: '1px solid #333', padding: '1rem', borderRadius: '8px', textAlign: 'left' }}>
              <p><strong>"{testimonial.testimonial_text}"</strong></p>
              <p>- {testimonial.author_name}</p>
              <small>Added: {new Date(testimonial.created_at).toLocaleDateString()}</small>
              <br />
              <button onClick={() => handleDeleteTestimonial(testimonial.id)} style={{ color: '#ff6666', marginTop: '0.5rem' }}>
                Delete
              </button>
              {/* We will add an Edit button here later */}
            </div>
          ))}
        </div>
      ) : (
        <p>You haven't added any testimonials yet. Use the form above to get started!</p>
      )}
    </div>
  );
}

export default DashboardPage;