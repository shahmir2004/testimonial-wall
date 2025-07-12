// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const EditModal = ({ testimonial, onSave, onCancel }) => {
  const [editedText, setEditedText] = useState(testimonial.testimonial_text);
  const [editedAuthor, setEditedAuthor] = useState(testimonial.author_name);

  const handleSave = () => {
    onSave({
      ...testimonial,
      testimonial_text: editedText,
      author_name: editedAuthor,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Edit Testimonial</h3>
        <label htmlFor="editAuthor">Author's Name</label>
        <input
          id="editAuthor"
          type="text"
          value={editedAuthor}
          onChange={(e) => setEditedAuthor(e.target.value)}
        />
        <label htmlFor="editText">Testimonial Text</label>
        <textarea
          id="editText"
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows="5"
        />
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

function DashboardPage() {
  const { user } = useAuth(); // Get the current logged-in user
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Form state for new testimonials
  const [authorName, setAuthorName] = useState('');
  const [testimonialText, setTestimonialText] = useState('');

  const [editingTestimonial, setEditingTestimonial] = useState(null);

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
  const handleUpdateTestimonial = async (updatedTestimonial) => {
    setStatusMessage('Updating...');
    const { data, error } = await supabase
      .from('testimonials')
      .update({
        testimonial_text: updatedTestimonial.testimonial_text,
        author_name: updatedTestimonial.author_name
      })
      .eq('id', updatedTestimonial.id)
      .select();

    if (error) {
      console.error('Error updating testimonial:', error);
      setStatusMessage('Error: Could not update testimonial.');
    } else {
      // Update the local state for an instant UI update
      setTestimonials(testimonials.map(t => t.id === updatedTestimonial.id ? data[0] : t));
      setStatusMessage('Testimonial updated successfully!');
    }
    setEditingTestimonial(null); // Close the modal
    setTimeout(() => setStatusMessage(''), 3000); // Clear message after 3s
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
   const handlePublishToggle = async (testimonial) => {
    const newStatus = !testimonial.is_published;
    const { data, error } = await supabase
      .from('testimonials')
      .update({ is_published: newStatus })
      .eq('id', testimonial.id)
      .select();

    if (error) {
      console.error('Error toggling publish status:', error);
      alert('Could not update status.');
    } else {
      setTestimonials(testimonials.map(t => t.id === testimonial.id ? data[0] : t));
    }
  };

  if (loading) return <p>Loading your testimonials...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  const embedCode = `<div id="testimonial-wall-container" data-user-id="${user?.id}"></div>\n<script src="${window.location.origin}/testimonial-widget.js" defer></script>`;

  return (
    <div className="dashboard-container">
      {editingTestimonial && (
        <EditModal
          testimonial={editingTestimonial}
          onSave={handleUpdateTestimonial}
          onCancel={() => setEditingTestimonial(null)}
        />
      )}
    
      <h2>Your Testimonials Dashboard</h2>
      {statusMessage && <div className="status-message">{statusMessage}</div>}
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
      <div className="testimonials-list">
        {testimonials.length > 0 ? (
          testimonials.map(testimonial => (
            <div key={testimonial.id} className={`testimonial-item ${!testimonial.is_published ? 'unpublished' : ''}`}>
              <p className="testimonial-item-text">"{testimonial.testimonial_text}"</p>
              <p className="testimonial-item-author">- {testimonial.author_name}</p>
              <div className="testimonial-item-footer">
                <small>Added: {new Date(testimonial.created_at).toLocaleDateString()}</small>
                <div className="testimonial-item-actions">
                  <button onClick={() => setEditingTestimonial(testimonial)} className="btn-icon">✏️ Edit</button>
                  <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="btn-icon btn-delete">🗑️ Delete</button>
                  <button onClick={() => handlePublishToggle(testimonial)} className="btn-icon btn-publish">
                    {testimonial.is_published ? '🙈 Unpublish' : '👁️ Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>You haven't added any testimonials yet. Use the form above to get started!</p>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;