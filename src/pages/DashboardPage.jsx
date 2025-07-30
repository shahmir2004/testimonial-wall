// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { itemFadeInUpVariants, sectionScrollRevealVariants, staggerContainerVariants } from '../utils/animationVariants';
import './DashboardPage.css';

// --- Icon Components ---
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const IconEdit = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const IconDelete = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const IconPublish = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconUnpublish = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>;
const IconMagic = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2.828 2.828 0 1 1 4 4L4 18l-1 3 3-1 14-14a2.828 2.828 0 0 1 4-4z"></path><path d="m22 2-2.5 2.5"></path><path d="m13 14 1 1"></path></svg>;

// --- EditModal Component (Modified to accept AI summary) ---
const EditModal = ({ testimonial, onSave, onCancel, summary }) => {
  const [editedText, setEditedText] = useState(summary || testimonial.testimonial_text);
  const [editedAuthor, setEditedAuthor] = useState(testimonial.author_name);
  const handleSave = () => { if (!editedAuthor.trim() || !editedText.trim()) { alert("Author and text cannot be empty."); return; } onSave({ ...testimonial, testimonial_text: editedText, author_name: editedAuthor }); };
  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="modal-content" initial={{ y: -30, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <h3>{summary ? "Review AI Summary" : "Edit Testimonial"}</h3>
        <div className="form-group"><label htmlFor="editAuthor">Author's Name</label><input id="editAuthor" type="text" value={editedAuthor} onChange={(e) => setEditedAuthor(e.target.value)} /></div>
        <div className="form-group"><label htmlFor="editText">Testimonial Text</label><textarea id="editText" value={editedText} onChange={(e) => setEditedText(e.target.value)} rows="6" /></div>
        <div className="modal-actions"><button onClick={onCancel} className="btn btn-secondary">Cancel</button><button onClick={handleSave} className="btn btn-primary">Save Changes</button></div>
      </motion.div>
    </motion.div>
  );
};

// --- WidgetCustomizer Component ---
// --- WidgetCustomizer Component (Revamped with Custom Controls) ---
const WidgetCustomizer = ({ userId, showStatusMessage }) => {
  const [theme, setTheme] = useState('light');
  
  // 1. Define a curated palette of professional, accessible colors
  const accentColorPalette = [
    { name: 'Brand Blue', value: '#005DFF' },
    { name: 'Emerald Green', value: '#10B981' },
    { name: 'Indigo Purple', value: '#6366F1' },
    { name: 'Crimson Red', value: '#DC2626' },
    { name: 'Amber Orange', value: '#F59E0B' },
    { name: 'Slate Grey', value: '#64748B' },
  ];
  
  const [accentColor, setAccentColor] = useState(accentColorPalette[0].value);
  const [showAvatars, setShowAvatars] = useState(true);
  const [showTitles, setShowTitles] = useState(true);

  const embedCode = `<div id="testimonial-wall-container"
  data-user-id="${userId || 'YOUR_USER_ID'}"
  data-theme="${theme}"
  data-accent-color="${accentColor}"
  data-show-avatars="${showAvatars}"
  data-show-titles="${showTitles}"
></div>
<script src="${window.location.origin}/testimonial-widget.js" defer></script>`;

  const copyEmbedCode = () => {
    const flatCode = embedCode.replace(/\n\s+/g, ' ').replace(/\n/g,'');
    navigator.clipboard.writeText(flatCode);
    showStatusMessage('Embed code copied!', 'success');
  };

  return (
    <div className="dashboard-card embed-card">
      <h3>Embed Your Wall</h3>
      <div className="card-content">
        <p className="embed-description">Customize your widget's appearance. The code below will update automatically.</p>
        
        {/* --- NEW, CUSTOM STYLED CUSTOMIZER --- */}
        <div className="customizer-options-revamped">
          
          <div className="option-group">
            <label>Theme</label>
            <div className="theme-selector">
              <button
                type="button" // Important for buttons in a form context
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                type="button"
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="option-group">
            <label>Accent Color</label>
            <div className="color-palette">
              {accentColorPalette.map(color => (
                <button
                  key={color.name}
                  type="button"
                  className={`color-swatch ${accentColor === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => setAccentColor(color.value)}
                  aria-label={`Set accent color to ${color.name}`}
                />
              ))}
            </div>
          </div>

          <div className="option-group full-width">
            <label>Display Options</label>
            <div className="checkbox-options-container">
              <label htmlFor="showAvatars" className="custom-checkbox-group">
                <input id="showAvatars" type="checkbox" checked={showAvatars} onChange={(e) => setShowAvatars(e.target.checked)} />
                <span>Show Avatars</span>
              </label>
              <label htmlFor="showTitles" className="custom-checkbox-group">
                <input id="showTitles" type="checkbox" checked={showTitles} onChange={(e) => setShowTitles(e.target.checked)} />
                <span>Show Author Titles</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="embed-code-block" onClick={copyEmbedCode} title="Click to copy">
          <div className="embed-code-header">
            <span>HTML Embed Code</span>
            <button className="copy-button"><IconCopy /> Copy</button>
          </div>
          <pre><code>{embedCode}</code></pre>
        </div>
      </div>
    </div>
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
  const [isSummarizing, setIsSummarizing] = useState(null);

  const fetchTestimonials = useCallback(async () => { if (!user) return; setLoading(true); try { const { data, error } = await supabase.from('testimonials').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (error) throw error; setTestimonials(data || []); } catch (err) { setError(err.message); } finally { setLoading(false); } }, [user]);
  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);

  const showStatusMessage = (text, type = 'info', duration = 3000) => { setStatusMessage({ text, type }); setTimeout(() => setStatusMessage({ text: '', type: '' }), duration); };
  const handleCreateTestimonial = async (e) => { e.preventDefault(); if (!authorName.trim() || !testimonialText.trim()) { showStatusMessage('Author and text are required.', 'error'); return; } setIsSubmitting(true); const { data, error } = await supabase.from('testimonials').insert([{ author_name: authorName, testimonial_text: testimonialText, user_id: user.id }]).select(); if (error) { showStatusMessage(`Error: ${error.message}`, 'error'); } else { setTestimonials([data[0], ...testimonials]); setAuthorName(''); setTestimonialText(''); showStatusMessage('Testimonial added!', 'success'); } setIsSubmitting(false); };
  const handleUpdateTestimonial = async (updatedTestimonial) => { const originalTestimonials = testimonials; setTestimonials(testimonials.map(t => t.id === updatedTestimonial.id ? updatedTestimonial : t)); setEditingTestimonial(null); const { error } = await supabase.from('testimonials').update({ testimonial_text: updatedTestimonial.testimonial_text, author_name: updatedTestimonial.author_name }).eq('id', updatedTestimonial.id); if (error) { showStatusMessage(`Error: ${error.message}`, 'error'); setTestimonials(originalTestimonials); } else { showStatusMessage('Testimonial updated!', 'success'); fetchTestimonials(); } };
  const handleDeleteTestimonial = async (id) => { if (!window.confirm('Are you sure?')) return; const originalTestimonials = testimonials; setTestimonials(testimonials.filter(t => t.id !== id)); const { error } = await supabase.from('testimonials').delete().eq('id', id); if (error) { showStatusMessage(`Error: ${error.message}`, 'error'); setTestimonials(originalTestimonials); } else { showStatusMessage('Testimonial deleted.', 'success'); } };
  const handlePublishToggle = async (testimonial) => { const newStatus = !testimonial.is_published; const originalTestimonials = testimonials; setTestimonials(testimonials.map(t => t.id === testimonial.id ? { ...t, is_published: newStatus } : t)); const { error } = await supabase.from('testimonials').update({ is_published: newStatus }).eq('id', testimonial.id); if (error) { showStatusMessage(`Error: ${error.message}`, 'error'); setTestimonials(originalTestimonials); } else { showStatusMessage(`Status changed to ${newStatus ? 'Published' : 'Unpublished'}`, 'success'); } };

      const handleAISummarize = async (testimonialToSummarize) => {
    setIsSummarizing(testimonialToSummarize.id);
    showStatusMessage('✨ Waking up the AI... This can take up to 30 seconds on the first try.', 'info', 40000);

    try {
      // --- STEP 1: CORRECTLY AWAIT THE SESSION ---
      // This is an asynchronous call and MUST be awaited.
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // --- STEP 2: VALIDATE THE SESSION AND TOKEN ---
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      if (!session) {
        throw new Error("Authentication error: You are not logged in. Please log in again.");
      }
      // This check prevents sending "Bearer undefined"
      if (!session.access_token) {
        throw new Error("Authentication error: Invalid session, no access token found.");
      }

       const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/summarize`; // Use relative path for same-origin requests

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          // --- STEP 3: USE THE CORRECT TOKEN ---
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: testimonialToSummarize.testimonial_text }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Request failed with status ${response.status}`);
      }
      setStatusMessage({ text: '', type: '' });
      
      
      setEditingTestimonial({ ...testimonialToSummarize, aiSummary: responseData.summary });

    } catch (error) {
      console.error("AI Summarize Error:", error);
      showStatusMessage(error.message || 'Failed to get AI summary.', 'error');
    } finally {
      setIsSummarizing(null);
      if (statusMessage.text.includes('Asking the AI')) {
        setStatusMessage({ text: '', type: '' });
      }
    }
  };

  if (loading) return <div className="page-loading-message">Loading Your Dashboard...</div>;
  if (error) return <div className="page-loading-message error">Error: {error}</div>;

  return (
    <>
      <AnimatePresence>{editingTestimonial && <EditModal testimonial={editingTestimonial} onSave={handleUpdateTestimonial} onCancel={() => setEditingTestimonial(null)} summary={editingTestimonial.aiSummary} />}</AnimatePresence>
      <div className="dashboard-page-wrapper">
        <motion.div className="container dashboard-content-container" variants={staggerContainerVariants} initial="hidden" animate="visible">
          <motion.header variants={itemFadeInUpVariants} className="dashboard-header">
            <h2>Dashboard</h2>
            <p>Manage, customize, and embed your "Wall of Love" from here.</p>
          </motion.header>
          <motion.div className="dashboard-grid">
            <motion.div className="dashboard-card form-card" variants={itemFadeInUpVariants}>
              <div className="card-header"><h3>Add New Testimonial</h3></div>
              <div className="card-content">
                <form onSubmit={handleCreateTestimonial}>
                  <div className="form-group"><label htmlFor="authorName">Author's Name</label><input id="authorName" type="text" placeholder="e.g., Jane Doe" value={authorName} onChange={(e) => setAuthorName(e.target.value)} required /></div>
                  <div className="form-group"><label htmlFor="testimonialText">Testimonial Text</label><textarea id="testimonialText" placeholder="The best service I've ever used!..." value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} rows="5" required /></div>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Testimonial'}</button>
                </form>
              </div>
            </motion.div>
            <motion.div variants={itemFadeInUpVariants}>
              <WidgetCustomizer userId={user?.id} showStatusMessage={showStatusMessage} />
            </motion.div>
          </motion.div>
          <motion.div variants={itemFadeInUpVariants} className="dashboard-card">
            <div className="card-header"><h3>Your Collection</h3><span className="collection-count">{testimonials.length} Testimonial{testimonials.length !== 1 && 's'}</span></div>
            <div className="card-content">
              {testimonials.length > 0 ? (
                <div className="testimonials-list">
                  <AnimatePresence>
                    {testimonials.map(testimonial => (
                      <motion.div key={testimonial.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, padding: 0, margin: 0, transition: { duration: 0.3 } }} className={`testimonial-item ${!testimonial.is_published ? 'unpublished' : ''}`}>
                        <div className="testimonial-item-content"><p className="testimonial-item-text">"{testimonial.testimonial_text}"</p><p className="testimonial-item-author">- {testimonial.author_name}</p></div>
                        <div className="testimonial-item-actions">
                          <button onClick={() => handleAISummarize(testimonial)} className="btn-icon btn-ai" title="AI Summarize" disabled={isSummarizing === testimonial.id}>{isSummarizing === testimonial.id ? '...' : <IconMagic />}</button>
                          <button onClick={() => handlePublishToggle(testimonial)} className="btn-icon" title={testimonial.is_published ? 'Unpublish' : 'Publish'}>{testimonial.is_published ? <IconUnpublish /> : <IconPublish />}</button>
                          <button onClick={() => setEditingTestimonial(testimonial)} className="btn-icon" title="Edit"><IconEdit /></button>
                          <button onClick={() => handleDeleteTestimonial(testimonial.id)} className="btn-icon btn-delete" title="Delete"><IconDelete /></button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="empty-state"><h4>Your wall is empty!</h4><p>Add your first testimonial using the form above.</p></div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
      <AnimatePresence>{statusMessage.text && (<motion.div className={`toast-message ${statusMessage.type}`} initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>{statusMessage.text}</motion.div>)}</AnimatePresence>
    </>
  );
}

export default DashboardPage;