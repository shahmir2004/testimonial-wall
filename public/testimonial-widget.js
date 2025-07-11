// public/testimonial-widget.js
(function() {
  // Find the container div on the user's site
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

  // The API URL will be the domain where this script is hosted
  const YOUR_APP_DOMAIN = "https://testimonial-wall.vercel.app"; // << REPLACE THIS
  const apiUrl = `${YOUR_APP_DOMAIN}/api/testimonials/${userId}`;
  // For local testing, you might need to override this:
  // const apiUrl = `http://localhost:5173/api/testimonials/${userId}`;

  // Add some basic styling
  const style = document.createElement('style');
  style.innerHTML = `
    .testimonial-wall {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333;
    }
    .testimonial-card {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    }
    .testimonial-card p {
      margin: 0 0 1rem 0;
      font-style: italic;
      color: #4b5563;
    }
    .testimonial-author {
      display: flex;
      align-items: center;
    }
    .testimonial-author-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 0.75rem;
      object-fit: cover;
    }
    .testimonial-author-info strong {
      display: block;
      font-weight: 600;
      color: #111827;
    }
    .testimonial-author-info span {
      font-size: 0.875rem;
      color: #6b7280;
    }
  `;
  document.head.appendChild(style);

  // Fetch testimonials and render them
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(testimonials => {
      if (testimonials && testimonials.length > 0) {
        const wall = document.createElement('div');
        wall.className = 'testimonial-wall';
        testimonials.forEach(t => {
          const card = document.createElement('div');
          card.className = 'testimonial-card';
          card.innerHTML = `
            <p>"${t.testimonial_text}"</p>
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
        container.appendChild(wall);
      } else {
        // Optional: Render a message if no testimonials
        container.innerHTML = '<p>No testimonials to display yet.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching or rendering testimonials:', error);
      container.innerHTML = '<p>Could not load testimonials.</p>';
    });
})();