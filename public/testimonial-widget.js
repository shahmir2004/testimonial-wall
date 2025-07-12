// public/testimonial-widget.js
(function() {
  const container = document.getElementById('testimonial-wall-container');
  if (!container) {
    console.error('Testimonial Wall: Container element not found.');
    return;
  }

  const userId = container.getAttribute('data-user-id');
  if (!userId) {
    console.error('Testimonial Wall: data-user-id attribute is missing.');
    return;
  }
  
  // Customization options from data attributes on the container
  const theme = container.getAttribute('data-theme') || 'light'; // 'light' or 'dark'
  const accentColor = container.getAttribute('data-accent-color') || '#007bff';
  const font = container.getAttribute('data-font') || 'sans-serif';

  // --- REFINED STYLES ---
  const style = document.createElement('style');
  style.innerHTML = `
    :root {
      --tw-font-family: ${font}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --tw-accent: ${accentColor};
      
      /* Light Theme Variables */
      --tw-bg-light: #ffffff;
      --tw-text-primary-light: #111827;
      --tw-text-secondary-light: #6b7280;
      --tw-border-light: #e5e7eb;

      /* Dark Theme Variables */
      --tw-bg-dark: #1f2937;
      --tw-text-primary-dark: #f9fafb;
      --tw-text-secondary-dark: #9ca3af;
      --tw-border-dark: #374151;
    }

    .testimonial-wall-wrapper {
      font-family: var(--tw-font-family);
      --tw-bg: ${theme === 'dark' ? 'var(--tw-bg-dark)' : 'var(--tw-bg-light)'};
      --tw-text-primary: ${theme === 'dark' ? 'var(--tw-text-primary-dark)' : 'var(--tw-text-primary-light)'};
      --tw-text-secondary: ${theme === 'dark' ? 'var(--tw-text-secondary-dark)' : 'var(--tw-text-secondary-light)'};
      --tw-border: ${theme === 'dark' ? 'var(--tw-border-dark)' : 'var(--tw-border-light)'};
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
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .testimonial-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
    }
    .testimonial-card-quote-icon {
      font-size: 2.5rem;
      line-height: 1;
      color: var(--tw-accent);
      opacity: 0.5;
    }
    .testimonial-card p.testimonial-text {
      flex-grow: 1;
      margin: 0.75rem 0 1.25rem 0;
      font-style: normal;
      font-size: 1rem;
      line-height: 1.6;
      color: var(--tw-text-primary);
    }
    .testimonial-author {
      display: flex;
      align-items: center;
      margin-top: auto;
    }
    .testimonial-author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      margin-right: 1rem;
      object-fit: cover;
      border: 2px solid var(--tw-border);
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
  `;
  document.head.appendChild(style);

  const YOUR_APP_DOMAIN = "https://testimonial-wall.vercel.app"; // << REPLACE THIS
  const apiUrl = `${YOUR_APP_DOMAIN}/api/testimonials/${userId}`;
  
  const wrapper = document.createElement('div');
  wrapper.className = 'testimonial-wall-wrapper';
  
  // --- FETCH & RENDER LOGIC ---
  fetch(apiUrl)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(testimonials => {
      if (testimonials && testimonials.length > 0) {
        const wall = document.createElement('div');
        wall.className = 'testimonial-wall';
        testimonials.forEach(t => {
          const card = document.createElement('div');
          card.className = 'testimonial-card';
          // Using a quote icon for more visual appeal
          card.innerHTML = `
            <div class="testimonial-card-quote-icon">“</div>
            <p class="testimonial-text">${t.testimonial_text}</p>
            <div class="testimonial-author">
              ${t.author_avatar_url ? `<img src="${t.author_avatar_url}" alt="${t.author_name}" class="testimonial-author-avatar">` : ''}
              <div class="testimonial-author-info">
                <strong>${t.author_name}</strong>
                ${t.author_title ? `<span>${t.author_title}</span>` : ''}
              </div>
            </div>
          `;
          wall.appendChild(card);
        });
        wrapper.appendChild(wall);
      } else {
        wrapper.innerHTML = '<p>No testimonials to display yet.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching or rendering testimonials:', error);
      wrapper.innerHTML = '<p>Could not load testimonials.</p>';
    })
    .finally(() => {
        container.appendChild(wrapper);
    });
})();


