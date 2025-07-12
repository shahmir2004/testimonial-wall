// public/testimonial-widget.js
(function() {
  const container = document.getElementById('testimonial-wall-container');
  if (!container) {
    // Fail silently in production, but log error for developers
    // console.error('Testimonial Wall: Container element with id "testimonial-wall-container" not found.');
    return;
  }

  const userId = container.getAttribute('data-user-id');
  if (!userId) {
    console.error('Testimonial Wall: The "data-user-id" attribute is missing from the container.');
    return;
  }

  // --- WIDGET CUSTOMIZATION OPTIONS ---
  // Read settings from data attributes, with sensible defaults
  const theme = container.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  const accentColor = container.getAttribute('data-accent-color') || (theme === 'dark' ? '#5A95FF' : '#005DFF'); // Default blue
  const font = container.getAttribute('data-font') || 'Inter';
  const showAvatars = container.getAttribute('data-show-avatars') !== 'false'; // Show by default
  const showTitles = container.getAttribute('data-show-titles') !== 'false'; // Show by default

  const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600&display=swap`;

  // --- DYNAMIC STYLESHEET ---
  const style = document.createElement('style');
  style.innerHTML = `
    /* Google Font Import */
    @import url('${fontUrl}');

    /* Widget CSS Variables Scope */
    .testimonial-wall-wrapper {
      --tw-font-family: '${font}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --tw-accent: ${accentColor};

      /* Light & Dark Theme Colors */
      --tw-bg-light: #ffffff;
      --tw-text-primary-light: #1f2937;
      --tw-text-secondary-light: #6b7280;
      --tw-border-light: #f3f4f6;

      --tw-bg-dark: #111827;
      --tw-text-primary-dark: #f9fafb;
      --tw-text-secondary-dark: #9ca3af;
      --tw-border-dark: #374151;
      
      /* Apply theme */
      --tw-bg: ${theme === 'dark' ? 'var(--tw-bg-dark)' : 'var(--tw-bg-light)'};
      --tw-text-primary: ${theme === 'dark' ? 'var(--tw-text-primary-dark)' : 'var(--tw-text-primary-light)'};
      --tw-text-secondary: ${theme === 'dark' ? 'var(--tw-text-secondary-dark)' : 'var(--tw-text-secondary-light)'};
      --tw-border: ${theme === 'dark' ? 'var(--tw-border-dark)' : 'var(--tw-border-light)'};

      font-family: var(--tw-font-family);
      color: var(--tw-text-primary);
    }

    .testimonial-wall {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .testimonial-card {
      background-color: var(--tw-bg);
      border: 1px solid var(--tw-border);
      border-radius: 12px;
      padding: 1.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%; /* Make cards in a row equal height */
      transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
    }
    .testimonial-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07);
    }
    .testimonial-card-quote-icon {
      width: 40px;
      height: 40px;
      color: var(--tw-accent);
    }
    .testimonial-card p.testimonial-text {
      flex-grow: 1; /* Pushes author to the bottom */
      margin: 1rem 0 1.5rem 0;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--tw-text-primary);
      white-space: pre-wrap; /* Preserve line breaks from user input */
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      margin-top: auto; /* Aligns to bottom if card text is short */
    }
    .testimonial-author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      margin-right: 1rem;
      object-fit: cover;
      border: 2px solid var(--tw-border);
      background-color: var(--tw-border);
    }
    .testimonial-author-info strong {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--tw-text-primary);
    }
    .testimonial-author-info span {
      font-size: 0.85rem;
      color: var(--tw-text-secondary);
    }
    .testimonial-wall-branding {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.8rem;
    }
    .testimonial-wall-branding a {
      color: var(--tw-text-secondary);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .testimonial-wall-branding a:hover {
      color: var(--tw-text-primary);
    }
  `;
  document.head.appendChild(style);

  // --- FETCH & RENDER LOGIC ---
   const YOUR_APP_DOMAIN = "https://testimonial-wall.vercel.app"; // << REPLACE THIS
  const apiUrl = `${YOUR_APP_DOMAIN}/api/testimonials/${userId}`;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'testimonial-wall-wrapper';
  
  // Show loading state
  wrapper.innerHTML = '<p>Loading testimonials...</p>';
  container.appendChild(wrapper);

  fetch(apiUrl)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(testimonials => {
      wrapper.innerHTML = ''; // Clear loading state
      if (testimonials && testimonials.length > 0) {
        const wall = document.createElement('div');
        wall.className = 'testimonial-wall';
        testimonials.forEach(t => {
          const card = document.createElement('div');
          card.className = 'testimonial-card';
          // Using a quote SVG for better scaling and styling
          card.innerHTML = `
            <svg class="testimonial-card-quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                <path d="M96 224C84.72 224 74.05 228.3 66.21 235.5L2.746 292.1C-8.213 302.1 4.582 320 17.91 320H96V224zM352 224C339.8 224 329.4 228.3 321.8 235.5L258.7 292.1C247.8 302.1 260.6 320 273.9 320H352V224zM0 384C0 357.5 21.5 336 48 336H160C177.7 336 192 350.3 192 368V480C192 497.7 177.7 512 160 512H48C21.5 512 0 490.5 0 464V384zM256 384C256 357.5 277.5 336 304 336H416C433.7 336 448 350.3 448 368V480C448 497.7 433.7 512 416 512H304C277.5 512 256 490.5 256 464V384z"/>
            </svg>
            <p class="testimonial-text">${t.testimonial_text.replace(/</g, "<").replace(/>/g, ">")}</p>
            <div class="testimonial-author">
              ${showAvatars && t.author_avatar_url ? `<img src="${t.author_avatar_url}" alt="${t.author_name}" class="testimonial-author-avatar">` : ''}
              <div class="testimonial-author-info">
                <strong>${t.author_name.replace(/</g, "<").replace(/>/g, ">")}</strong>
                ${showTitles && t.author_title ? `<span>${t.author_title.replace(/</g, "<").replace(/>/g, ">")}</span>` : ''}
              </div>
            </div>
          `;
          wall.appendChild(card);
        });
        wrapper.appendChild(wall);
        // Add branding
        const branding = document.createElement('div');
        branding.className = 'testimonial-wall-branding';
        branding.innerHTML = `Powered by <a href="${YOUR_APP_DOMAIN}" target="_blank">Testimonial Wall</a>`;
        wrapper.appendChild(branding);
      } else {
        wrapper.innerHTML = '<p>No testimonials to display yet.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching or rendering testimonials:', error);
      wrapper.innerHTML = '<p>Could not load testimonials.</p>';
    });
})();

