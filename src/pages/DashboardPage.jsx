// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardPage.css'; // We'll create new styles for this
import {
  itemFadeInUpVariants,
  sectionScrollRevealVariants
} from '../utils/animationVariants'; // <<--- ADD THIS IMPORT

// --- Reusable Icon Components (or import from a library like react-icons) ---
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const IconPublish = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconUnpublish = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;

// --- EditModal Component ---
const EditModal = ({ testimonial, onSave, onCancel }) => {
  const [editedText, setEditedText] = useState(testimonial.testimonial_text);
  const [editedAuthor, setEditedAuthor] = useState(testimonial.author_name);

  const handleSave = () => {
    if (!editedAuthor.trim() || !editedText.trim()) {
      alert("Author and text cannot be empty.");
      return;
    }
    onSave({ ...testimonial, testimonial_text: editedText, author_name: editedAuthor });
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal-content"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h3>Edit Testimonial</h3>
        <div className="form-group">
          <label htmlFor="editAuthor">Author's Name</label>
          <input id="editAuthor" type="text" value={editedAuthor} onChange={(e) => setEditedAuthor(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="editText">Testimonial Text</label>
          <textarea id="editText" value={editedText} onChange={(e) => setEditedText(e.target.value)} rows="6" />
        </div>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
        </div>
      </motion.div>
    </motion.div>
  );
};


// --- Main Dashboard Page Component ---
function DashboardPage() {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const [authorName, setAuthorName] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const fetchTestimonials = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const showStatusMessage = (text, type = 'info', duration = 3000) => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: '' }), duration);
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !testimonialText.trim()) {
      showStatusMessage('Author name and text are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ author_name: authorName, testimonial_text: testimonialText, user_id: user.id }])
      .select();

    if (error) {
      showStatusMessage(`Error: ${error.message}`, 'error');
    } else {
      setTestimonials([data[0], ...testimonials]);
      setAuthorName('');
      setTestimonialText('');
      showStatusMessage('Testimonial added successfully!', 'success');
    }
    setIsSubmitting(false);
  };

  const handleUpdateTestimonial = async (updatedTestimonial) => {
    const originalTestimonials = testimonials;
    setTestimonials(testimonials.map(t => t.id === updatedTestimonial.id ? updatedTestimonial : t));
    setEditingTestimonial(null);

    const { error } = await supabase
      .from('testimonials')
      .update({ testimonial_text: updatedTestimonial.testimonial_text, author_name: updatedTestimonial.author_name })
      .eq('id', updatedTestimonial.id);

    if (error) {
      showStatusMessage(`Error: ${error.message}`, 'error');
      setTestimonials(originalTestimonials); // Revert on error
    } else {
      showStatusMessage('Testimonial updated!', 'success');
      // No need to refetch, already updated optimistically
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    const originalTestimonials = testimonials;
    setTestimonials(testimonials.filter(t => t.id !== id));

    const { error } = await supabase.from('testimonials').delete().eq('id', id);

    if (error) {
      showStatusMessage(`Error: ${error.message}`, 'error');
      setTestimonials(originalTestimonials); // Revert on error
    } else {
      showStatusMessage('Testimonial deleted.', 'success');
    }
  };

  const handlePublishToggle = async (testimonial) => {
    const newStatus = !testimonial.is_published;
    const originalTestimonials = testimonials;
    setTestimonials(testimonials.map(t => t.id === testimonial.id ? { ...t, is_published: newStatus } : t));

    const { error } = await supabase
      .from('testimonials')
      .update({ is_published: newStatus })
      .eq('id', testimonial.id);

    if (error) {
      showStatusMessage(`Error: ${error.message}`, 'error');
      setTestimonials(originalTestimonials); // Revert on error
    } else {
      showStatusMessage(`Status changed to ${newStatus ? 'Published' : 'Unpublished'}`, 'success');
    }
  };

  const embedCode = `<div id="testimonial-wall-container" data-user-id="${user?.id}"></div>\n<script src="${window.location.origin}/testimonial-widget.js" defer></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    showStatusMessage('Embed code copied to clipboard!', 'success');
  };

  if (loading) return <div className="dashboard-message">Loading your testimonials...</div>;
  if (error) return <div className="dashboard-message error">Error: {error}</div>;

  return (
    <>
      <AnimatePresence>
        {editingTestimonial && (
          <EditModal
            testimonial={editingTestimonial}
            onSave={handleUpdateTestimonial}
            onCancel={() => setEditingTestimonial(null)}
          />
        )}
      </AnimatePresence>

      <div className="dashboard-container">
        <motion.header className="dashboard-header" initial={{opacity:0, y: -20}} animate={{opacity:1, y: 0}}>
          <h2>Dashboard</h2>
          <p>Manage, publish, and embed your "Wall of Love" from here.</p>
        </motion.header>

        {/* --- Main Dashboard Grid Layout --- */}
        <div className="dashboard-grid">
          
          <motion.div className="dashboard-card form-card" variants={itemFadeInUpVariants}>
            <h3>Add a New Testimonial</h3>
            <form onSubmit={handleCreateTestimonial}>
              <div className="form-group">
                <label htmlFor="authorName">Author's Name</label>
                <input id="authorName" type="text" placeholder="e.g., Jane Doe" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="testimonialText">Testimonial Text</label>
                <textarea id="testimonialText" placeholder="The best service I've ever used!..." value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} rows="5" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Testimonial'}
              </button>
            </form>
          </motion.div>

          <motion.div className="dashboard-card embed-card" variants={itemFadeInUpVariants}>
            <h3>Embed Your Wall</h3>
            <p className="embed-description">Copy this code and paste it into your website's HTML to display your testimonials.</p>
            <div className="embed-code-wrapper" onClick={copyEmbedCode}>
              <pre><code>{embedCode}</code></pre>
              <div className="copy-icon"><IconCopy /></div>
            </div>
          </motion.div>

        </div>

        <motion.div className="dashboard-collection" variants={sectionScrollRevealVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          <h3>Your Collection ({testimonials.length})</h3>
          {testimonials.length > 0 ? (
            <div className="testimonials-list">
              <AnimatePresence>
                {testimonials.map(testimonial => (
                  <motion.div
                    key={testimonial.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                    className={`testimonial-item ${!testimonial.is_published ? 'unpublished' : ''}`}
                  >
                    <p className="testimonial-item-text">"{testimonial.testimonial_text}"</p>
                    <p className="testimonial-item-author">- {testimonial.author_name}</p>
                    <div className="testimonial-item-footer">
                      <small>Added: {new Date(testimonial.created_at).toLocaleDateString()}</small>
                      <div className="testimonial-item-actions">
                        <button onClick={() => handlePublishToggle(testimonial)} className="btn-icon btn-publish" title={testimonial.is_published ? 'Unpublish' : 'Publish'}>
                          {testimonial.is_published ? <IconUnpublish /> : <IconPublish />}
                        </button>
                        <button onClick={() => setEditingTestimonial(testimonial)} className="btn-icon" title="Edit">
                          <IconEdit />
                        </button>
                        <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="btn-icon btn-delete" title="Delete">
                          <IconDelete />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't added any testimonials yet.</p>
              <span>Use the form above to get started!</span>
            </div>
          )}
        </motion.div>

      </div>
      
      {/* Animated Status Message Toast */}
      <AnimatePresence>
          {statusMessage.text && (
            <motion.div
              className={`toast-message ${statusMessage.type}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {statusMessage.text}
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}

export default DashboardPage;