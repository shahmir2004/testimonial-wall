// public/testimonial-widget.js
(function() {
  // Find the container div on the user's site
  const container = document.getElementById('testimonial-wall-container');
  if (!container) {
    // Silently fail if the container isn't on the page
    return;
  }

  const userId = container.getAttribute('data-user-id');
  if (!userId) {
    console.error('Testimonial Wall: The "data-user-id" attribute is missing from the container.');
    return;
  }
  
  // --- 1. FUNCTION TO APPLY STYLES AND THEME ---
  // This function reads the data attributes and injects/updates the stylesheet
  function applyStylesAndTheme() {
    // Read the current settings from the data attributes each time this is called
    const theme = container.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const accentColor = container.getAttribute('data-accent-color') || (theme === 'dark' ? '#5A95FF' : '#005DFF');
    const font = container.getAttribute('data-font') || 'Inter';
    
    const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600&display=swap`;

    // Find the existing style tag or create a new one
    let styleTag = document.getElementById('testimonial-widget-styles');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'testimonial-widget-styles';
      document.head.appendChild(styleTag);
    }
    
    // Update the innerHTML of the style tag with the latest theme settings
    styleTag.innerHTML = `
      @import url('${fontUrl}');
      .testimonial-wall-wrapper {
        --tw-font-family: '${font}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        --tw-accent: ${accentColor};
        
        /* Define colors for both themes */
        --tw-bg-light: #ffffff; --tw-text-primary-light: #1f2937; --tw-text-secondary-light: #6b7280; --tw-border-light: #f3f4f6;
        --tw-bg-dark: #111827; --tw-text-primary-dark: #f9fafb; --tw-text-secondary-dark: #9ca3af; --tw-border-dark: #374151;
        
        /* Apply the current theme using the variables */
        --tw-bg: ${theme === 'dark' ? 'var(--tw-bg-dark)' : 'var(--tw-bg-light)'};
        --tw-text-primary: ${theme === 'dark' ? 'var(--tw-text-primary-dark)' : 'var(--tw-text-primary-light)'};
        --tw-text-secondary: ${theme === 'dark' ? 'var(--tw-text-secondary-dark)' : 'var(--tw-text-secondary-light)'};
        --tw-border: ${theme === 'dark' ? 'var(--tw-border-dark)' : 'var(--tw-border-light)'};
        
        font-family: var(--tw-font-family);
        color: var(--tw-text-primary);
      }
      .testimonial-wall { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
      .testimonial-card { 
        background-color: var(--tw-bg); 
        border: 1px solid var(--tw-border); 
        border-radius: 12px; 
        padding: 1.75rem; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05); 
        display: flex; 
        flex-direction: column; 
        height: 100%; 
        /* Add transitions for smooth theme changes */
        transition: transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.3s ease, border-color 0.3s ease; 
      }
      .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07); }
      .testimonial-card-quote-icon { width: 40px; height: 40px; color: var(--tw-accent); opacity: 0.5; transition: color 0.3s ease; }
      .testimonial-card p.testimonial-text { flex-grow: 1; margin: 1rem 0 1.5rem 0; font-size: 1rem; line-height: 1.6; color: var(--tw-text-primary); white-space: pre-wrap; transition: color 0.3s ease; }
      .testimonial-author { display: flex; align-items: center; margin-top: auto; }
      .testimonial-author-avatar { width: 44px; height: 44px; border-radius: 50%; margin-right: 1rem; object-fit: cover; border: 2px solid var(--tw-border); background-color: var(--tw-border); transition: border-color 0.3s ease, background-color 0.3s ease; }
      .testimonial-author-info strong { display: block; font-weight: 600; font-size: 0.95rem; color: var(--tw-text-primary); transition: color 0.3s ease; }
      .testimonial-author-info span { font-size: 0.85rem; color: var(--tw-text-secondary); transition: color 0.3s ease; }
      .testimonial-wall-branding { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; }
      .testimonial-wall-branding a { color: var(--tw-text-secondary); text-decoration: none; transition: color 0.2s ease; }
      .testimonial-wall-branding a:hover { color: var(--tw-text-primary); }
    `;
  }
  
  // --- 2. THE MUTATION OBSERVER ---
  // This listens for changes to the container's data attributes
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      // If any 'data-*' attribute changes, re-run the styling function
      if (mutation.type === 'attributes' && mutation.attributeName.startsWith('data-')) {
        applyStylesAndTheme();
        break; // Stop after the first relevant change is found
      }
    }
  });

  // Tell the observer to start watching the container element
  observer.observe(container, { attributes: true });

  // --- 3. INITIAL FETCH AND RENDER LOGIC ---
  // This part runs only once to fetch and build the HTML content
  function fetchAndRenderTestimonials() {
    // Use your deployed app's domain for the API and branding link
    const YOUR_APP_DOMAIN = "https://testimonial-wall.vercel.app"; // Set this to your live domain
    const apiUrl = `${YOUR_APP_DOMAIN}/api/testimonials/${userId}`;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'testimonial-wall-wrapper';
    wrapper.innerHTML = '<p>Loading testimonials...</p>';
    container.innerHTML = ''; // Clear container in case of re-runs
    container.appendChild(wrapper);

    fetch(apiUrl)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(testimonials => {
        wrapper.innerHTML = ''; // Clear loading message
        if (testimonials && testimonials.length > 0) {
          const wall = document.createElement('div');
          wall.className = 'testimonial-wall';
          testimonials.forEach(t => {
              const card = document.createElement('div');
              card.className = 'testimonial-card';
              const safeText = (str) => str ? str.replace(/</g, "<").replace(/>/g, ">") : '';
              const showAvatars = container.getAttribute('data-show-avatars') !== 'false';
              const showTitles = container.getAttribute('data-show-titles') !== 'false';
              card.innerHTML = `
                  <svg class="testimonial-card-quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor"><path d="M96 224C84.72 224 74.05 228.3 66.21 235.5L2.746 292.1C-8.213 302.1 4.582 320 17.91 320H96V224zm256 0c-12.17 0-22.55 4.34-30.39 11.5L258.7 292.1c-10.96 10-2.172 27.9 11.16 27.9H352V224zM0 384C0 357.5 21.5 336 48 336H160c17.67 0 32 14.33 32 32v112c0 17.67-14.33 32-32 32H48C21.5 512 0 490.5 0 464V384zm256 0c0-27.5 22.5-48 48-48h112c17.67 0 32 14.33 32 32v112c0 17.67-14.33 32-32 32H304c-26.5 0-48-21.5-48-48V384z"/></svg>
                  <p class="testimonial-text">${safeText(t.testimonial_text)}</p>
                  <div class="testimonial-author">
                      ${showAvatars && t.author_avatar_url ? `<img src="${t.author_avatar_url}" alt="${safeText(t.author_name)}" class="testimonial-author-avatar">` : ''}
                      <div class="testimonial-author-info"><strong>${safeText(t.author_name)}</strong>${showTitles && t.author_title ? `<span>${safeText(t.author_title)}</span>` : ''}</div>
                  </div>`;
              wall.appendChild(card);
          });
          wrapper.appendChild(wall);
          const branding = document.createElement('div');
          branding.className = 'testimonial-wall-branding';
          branding.innerHTML = `Powered by <a href="${YOUR_APP_DOMAIN}" target="_blank">Testimonial Wall</a>`;
          wrapper.appendChild(branding);
        } else { wrapper.innerHTML = '<p>No testimonials to display yet.</p>'; }
    }).catch(err => { console.error(err); wrapper.innerHTML = '<p>Could not load testimonials.</p>'; });
  }

  // --- Run the initial setup ---
  applyStylesAndTheme();
  fetchAndRenderTestimonials();

})();