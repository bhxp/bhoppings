document.addEventListener('DOMContentLoaded', () => {
  const appsGrid = document.getElementById('appsGrid');
  const searchInput = document.getElementById('searchInput');
  const template = document.getElementById('app-card-template');
  let apps = [];

  async function fetchApps() {
    try {
      const response = await fetch('/api/scan-ai-apps');
      const data = await response.json();
      apps = data;
      renderApps(apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      // For demo, generate some sample apps
      apps = generateSampleApps();
      renderApps(apps);
    }
  }

  function generateSampleApps() {
    return [
      {
        name: 'Chat Bot',
        description: 'An interactive AI chatbot that can answer your questions.',
        path: '/public/ai/chatbot/index.html',
        icon: '🤖'
      },
      {
        name: 'Image Generator',
        description: 'Create unique images using AI algorithms.',
        path: '/public/ai/image-gen/index.html',
        icon: '🎨'
      },
      {
        name: 'Text Adventure',
        description: 'Embark on an AI-powered interactive story.',
        path: '/public/ai/text-adventure/index.html',
        icon: '📖'
      }
    ];
  }

  function renderApps(appsToRender) {
    appsGrid.innerHTML = '';
    
    appsToRender.forEach(app => {
      const card = template.content.cloneNode(true);
      
      const iconText = card.querySelector('.icon-text');
      iconText.textContent = app.icon;
      
      const name = card.querySelector('.app-name');
      name.textContent = app.name;
      
      const description = card.querySelector('.app-description');
      description.textContent = app.description;
      
      const playButton = card.querySelector('.play-button');
      playButton.href = app.path;
      
      appsGrid.appendChild(card);
    });
  }

  function filterApps(searchTerm) {
    const filtered = apps.filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderApps(filtered);
  }

  searchInput.addEventListener('input', (e) => {
    filterApps(e.target.value);
  });

  fetchApps();
});
