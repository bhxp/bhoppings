const API_URL = 'https://text.pollinations.ai/';
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt/';

let chatHistory = [];

const modelConfigs = {
  'openai': { name: 'OpenAI GPT-4o-mini', censored: true },
  'openai-large': { name: 'OpenAI GPT-4o', censored: true },
  'qwen-coder': { name: 'Qwen 2.5 Coder 32B', censored: true },
  'llama': { name: 'Llama 3.3 70B', censored: false },
  'mistral': { name: 'Mistral Nemo', censored: false },
  'unity': { name: 'Unity with Mistral Large', censored: false },
  'midijourney': { name: 'Midijourney musical transformer', censored: true },
  'rtist': { name: 'Rtist image generator', censored: true },
  'searchgpt': { name: 'SearchGPT with realtime news', censored: true },
  'evil': { name: 'Evil Mode - Experimental', censored: false },
  'deepseek': { name: 'DeepSeek-V3', censored: true },
  'claude-hybridspace': { name: 'Claude Hybridspace', censored: true },
  'deepseek-r1': { name: 'DeepSeek-R1 Distill Qwen 32B', censored: true },
  'deepseek-reasoner': { name: 'DeepSeek R1 - Full', censored: true },
  'llamalight': { name: 'Llama 3.1 8B Instruct', censored: false },
  'llamaguard': { name: 'Llamaguard 7B AWQ', censored: false },
  'gemini': { name: 'Gemini 2.0 Flash', censored: true },
  'gemini-thinking': { name: 'Gemini 2.0 Flash Thinking', censored: true },
  'hormoz': { name: 'Hormoz 8b', censored: false }
};

const QUALITY_PRESETS = {
  'draft': { name: 'Draft', steps: 20, cfg: 7 },
  'normal': { name: 'Normal', steps: 30, cfg: 7.5 },
  'high': { name: 'High Quality', steps: 40, cfg: 8 },
  'max': { name: 'Maximum', steps: 50, cfg: 8.5 }
};

const STYLE_MODIFIERS = {
  'enhance': 'highly detailed, professional, award winning',
  'sharp': 'sharp focus, 8k uhd, high resolution',
  'dramatic': 'dramatic lighting, cinematic, professional photography',
  'artistic': 'artistic, professional, masterpiece',
  'realistic': 'photorealistic, hyperrealistic, ultrarealistic'
};

const THEMES = {
  'dark': {
    name: 'Dark',
    backgroundClasses: ['bg-gradient-to-br', 'from-gray-900', 'via-blue-900/20', 'to-black'],
    textClass: 'text-white',
    cardClasses: ['from-gray-800/50', 'to-gray-900/50'],
    inputClasses: ['bg-black/30', 'border-white/5'],
    accent: 'purple'
  },
  'cyberpunk': {
    name: 'Cyberpunk',
    backgroundClasses: ['bg-gradient-to-br', 'from-purple-900', 'via-pink-900/20', 'to-black'],
    textClass: 'text-pink-50',
    cardClasses: ['from-purple-800/50', 'to-pink-900/50'],
    inputClasses: ['bg-purple-900/30', 'border-pink-500/10'],
    accent: 'pink'
  },
  'forest': {
    name: 'Forest',
    backgroundClasses: ['bg-gradient-to-br', 'from-green-900', 'via-emerald-900/20', 'to-black'],
    textClass: 'text-emerald-50',
    cardClasses: ['from-green-800/50', 'to-emerald-900/50'],
    inputClasses: ['bg-green-900/30', 'border-emerald-500/10'],
    accent: 'emerald'
  },
  'ocean': {
    name: 'Ocean',
    backgroundClasses: ['bg-gradient-to-br', 'from-blue-900', 'via-cyan-900/20', 'to-black'],
    textClass: 'text-cyan-50',
    cardClasses: ['from-blue-800/50', 'to-cyan-900/50'],
    inputClasses: ['bg-blue-900/30', 'border-cyan-500/10'],
    accent: 'cyan'
  }
};

const promptInput = document.getElementById('promptInput');
const enhanceBtn = document.getElementById('enhanceBtn');
const generateBtn = document.getElementById('generateBtn');
const chatHistoryDiv = document.getElementById('chatHistory');
const imageResults = document.getElementById('imageResults');
const modelSelect = document.getElementById('modelSelect');
const imageCountSelect = document.getElementById('imageCountSelect');

const presets = {
  'cinematic': 'cinematic, dramatic lighting, high detail, 8k',
  'anime': 'anime style, vibrant colors, detailed, studio ghibli inspired',
  'portrait': 'portrait, professional photography, bokeh, natural lighting',
  'fantasy': 'fantasy art, magical, ethereal, detailed environment',
  'abstract': 'abstract art, contemporary, vibrant colors, geometric',
  'minimalist': 'minimalist, clean lines, simple composition, elegant',
  'neon': 'neon lighting, cyberpunk, futuristic, vibrant colors',
  'vintage': 'vintage style, retro aesthetic, nostalgic, film grain',
  'nature': 'nature photography, golden hour, serene, detailed landscape'
};

enhanceBtn.addEventListener('click', enhancePrompt);
generateBtn.addEventListener('click', generateImages);

async function enhancePrompt() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  enhanceBtn.disabled = true;
  const enhanceSpinner = enhanceBtn.querySelector('.spinner');
  const enhanceIcon = enhanceBtn.querySelector('.enhance-icon');
  enhanceSpinner.classList.remove('hidden');
  enhanceIcon.classList.add('hidden');
  
  try {
    const messages = [
      {
        role: "system",
        content: "You are a prompt engineering expert specializing in creating detailed, artistic image generation prompts. Your role is to enhance prompts by adding artistic style, mood, lighting, composition, and technical details. Keep responses concise and focused on the enhanced prompt only."
      },
      {
        role: "user",
        content: `Enhance this image prompt with artistic details and technical specifications: ${prompt}`
      }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: "openai",
        seed: Math.floor(Math.random() * 1000),
        jsonMode: false
      })
    });

    const enhancedPrompt = await response.text();
    
    chatHistory.push({
      role: "user",
      content: prompt
    });
    chatHistory.push({
      role: "assistant",
      content: enhancedPrompt
    });

    displayChatMessage(prompt, enhancedPrompt);
    promptInput.value = enhancedPrompt;
    chatHistoryDiv.classList.add('show');

  } catch (error) {
    console.error('Error:', error);
    alert('Failed to enhance prompt. Please try again.');
  } finally {
    enhanceBtn.disabled = false;
    enhanceSpinner.classList.add('hidden');
    enhanceIcon.classList.remove('hidden');
  }
}

function displayChatMessage(original, enhanced) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50';
  messageDiv.innerHTML = `
    <div class="text-gray-400 mb-2">Original: ${original}</div>
    <div class="text-green-400">Enhanced: ${enhanced}</div>
  `;
  chatHistoryDiv.appendChild(messageDiv);
}

async function generateImages() {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  const generateSpinner = generateBtn.querySelector('.spinner');
  const generateIcon = generateBtn.querySelector('.generate-icon');
  generateSpinner.classList.remove('hidden');
  generateIcon.classList.add('hidden');
  generateBtn.disabled = true;
  
  // Clear previous results
  imageResults.innerHTML = '';
  imageResults.classList.remove('show');
  imageResults.classList.remove('hidden');
  
  // Force a reflow to ensure the animation plays
  void imageResults.offsetWidth;
  
  imageResults.classList.add('show');
  
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(imageCountSelect.value);
  const modelConfig = modelConfigs[selectedModel];
  
  const imagePromises = [];
  
  for (let i = 0; i < imageCount; i++) {
    const imageContainer = createImageContainer(i);
    imageResults.appendChild(imageContainer);
    
    const promise = generateSingleImage(prompt, imageContainer, modelConfig);
    imagePromises.push(promise);
  }
  
  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.error('Error generating images:', error);
  } finally {
    generateBtn.disabled = false;
    generateSpinner.classList.add('hidden');
    generateIcon.classList.remove('hidden');
  }
  
  // Smooth scroll to results
  setTimeout(() => {
    imageResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function createImageContainer(index) {
  const container = document.createElement('div');
  container.className = 'relative rounded-xl overflow-hidden shadow-2xl bg-gray-800/30 group';
  container.innerHTML = `
    <div class="loading-overlay absolute inset-0 flex items-center justify-center bg-gray-800/90 backdrop-blur-sm z-10">
      <div class="flex items-center space-x-3">
        <div class="spinner"></div>
        <span class="text-lg">Generating image ${index + 1}...</span>
      </div>
    </div>
    <img class="w-full rounded-xl generated-image" src="" alt="Generated image ${index + 1}">
    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
      <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
    </div>
  `;
  return container;
}

async function generateSingleImage(prompt, container, modelConfig) {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);
  
  // Get advanced parameters
  const width = document.getElementById('widthInput').value;
  const height = document.getElementById('heightInput').value;
  const quality = document.getElementById('qualitySelect').value;
  const guidance = document.getElementById('guidanceInput').value;
  const steps = document.getElementById('stepsInput').value;
  const styleModifiers = Array.from(document.querySelectorAll('input[name="styleModifier"]:checked'))
    .map(input => STYLE_MODIFIERS[input.value])
    .join(', ');
  
  // Build URL with all parameters
  let imageUrl = `${IMAGE_API_URL}${encodedPrompt}${styleModifiers ? `, ${styleModifiers}` : ''}?nologo=true&seed=${seed}&model=${modelSelect.value}`;
  
  if (width) imageUrl += `&width=${width}`;
  if (height) imageUrl += `&height=${height}`;
  if (guidance) imageUrl += `&cfg=${guidance}`;
  if (steps) imageUrl += `&steps=${steps}`;

  try {
    const generatedImage = container.querySelector('.generated-image');
    const loadingOverlay = container.querySelector('.loading-overlay');
    
    generatedImage.src = imageUrl;
    
    await new Promise((resolve, reject) => {
      generatedImage.onload = () => {
        // Ensure the image has loaded before showing it
        setTimeout(() => {
          generatedImage.classList.add('loaded');
          loadingOverlay.style.opacity = '0';
          setTimeout(() => {
            loadingOverlay.style.display = 'none';
          }, 300);
          resolve();
        }, 100);
      };
      generatedImage.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    });
  } catch (error) {
    console.error('Error loading image:', error);
    container.innerHTML = '<div class="p-4 text-red-400">Failed to generate image</div>';
  }
}

// Add Advanced Options Toggle
const advancedOptionsBtn = document.getElementById('advancedOptionsBtn');
const advancedOptions = document.getElementById('advancedOptions');
const advancedChevron = document.getElementById('advancedChevron');

advancedOptionsBtn.addEventListener('click', () => {
  advancedOptions.classList.toggle('hidden');
  advancedChevron.classList.toggle('rotate-90');
});

// Validate width and height inputs
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');

function validateDimension(input) {
  let value = parseInt(input.value);
  if (value < 64) {
    value = 64;
  }
  // Round to nearest multiple of 64
  value = Math.round(value / 64) * 64;
  input.value = value || '';
}

widthInput.addEventListener('blur', () => validateDimension(widthInput));
heightInput.addEventListener('blur', () => validateDimension(heightInput));

// Auto-resize textarea
promptInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// Keypress handling
promptInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateImages();
  } else if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    enhancePrompt();
  }
});

function setupImagePreview() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const closeModal = document.getElementById('closeModal');

  // Delegate event listener to handle dynamic images
  imageResults.addEventListener('click', (e) => {
    const image = e.target.closest('.generated-image');
    if (image) {
      openModal(image.src);
    }
  });

  closeModal.addEventListener('click', closeModalHandler);

  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalHandler();
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModalHandler();
    }
  });
}

function openModal(imageSrc) {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  
  document.body.classList.add('modal-open');
  modal.classList.remove('hidden');
  
  // Force reflow
  void modal.offsetWidth;
  
  modal.classList.add('show');
  modalImage.src = imageSrc;
  
  // Wait for image to load before showing
  modalImage.onload = () => {
    modalImage.classList.add('show');
  };
}

function closeModalHandler() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  
  modalImage.classList.remove('show');
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
  
  // Hide modal after transition
  setTimeout(() => {
    modal.classList.add('hidden');
    modalImage.src = '';
  }, 300);
}

// Initialize image preview functionality
setupImagePreview();

function setupPresets() {
  const presetsContainer = document.getElementById('presets');
  
  Object.entries(presets).forEach(([name, suffix]) => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn px-4 py-2 rounded-lg text-sm capitalize';
    btn.textContent = name;
    btn.addEventListener('click', () => {
      const currentPrompt = promptInput.value.trim();
      promptInput.value = currentPrompt ? `${currentPrompt}, ${suffix}` : suffix;
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    presetsContainer.appendChild(btn);
  });
}

function setupAdvancedOptions() {
  const advancedContainer = document.getElementById('advancedOptions');
  
  // Add quality preset selector
  const qualityDiv = document.createElement('div');
  qualityDiv.className = 'space-y-2';
  qualityDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Quality Preset</label>
    <select id="qualitySelect" class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
      ${Object.entries(QUALITY_PRESETS).map(([key, preset]) => 
        `<option value="${key}">${preset.name}</option>`
      ).join('')}
    </select>
  `;
  
  // Add guidance scale input
  const guidanceDiv = document.createElement('div');
  guidanceDiv.className = 'space-y-2';
  guidanceDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Guidance Scale (7-30)</label>
    <input type="number" id="guidanceInput" min="7" max="30" step="0.5" value="7.5"
      class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
  `;
  
  // Add steps input
  const stepsDiv = document.createElement('div');
  stepsDiv.className = 'space-y-2';
  stepsDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Steps (20-150)</label>
    <input type="number" id="stepsInput" min="20" max="150" step="5" value="30"
      class="w-full bg-black/30 text-white rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-white/5">
  `;
  
  // Add style modifiers
  const styleDiv = document.createElement('div');
  styleDiv.className = 'space-y-2 col-span-2';
  styleDiv.innerHTML = `
    <label class="text-sm text-gray-400 ml-1">Style Modifiers</label>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      ${Object.entries(STYLE_MODIFIERS).map(([key, value]) => `
        <label class="flex items-center space-x-2 bg-black/30 p-3 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5">
          <input type="checkbox" name="styleModifier" value="${key}" class="rounded text-purple-500 focus:ring-purple-500">
          <span class="text-sm">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </label>
      `).join('')}
    </div>
  `;
  
  // Append new elements to advanced options
  advancedContainer.appendChild(qualityDiv);
  advancedContainer.appendChild(guidanceDiv);
  advancedContainer.appendChild(stepsDiv);
  advancedContainer.appendChild(styleDiv);
  
  // Add event listeners
  document.getElementById('qualitySelect').addEventListener('change', (e) => {
    const preset = QUALITY_PRESETS[e.target.value];
    document.getElementById('stepsInput').value = preset.steps;
    document.getElementById('guidanceInput').value = preset.cfg;
  });
}

function saveToHistory(prompt, result) {
  const history = JSON.parse(localStorage.getItem('nexaHistory') || '[]');
  history.unshift({ prompt, result, timestamp: Date.now() });
  localStorage.setItem('nexaHistory', JSON.stringify(history.slice(0, 50))); // Keep last 50 items
}

function loadHistory() {
  return JSON.parse(localStorage.getItem('nexaHistory') || '[]');
}

function suggestPrompts() {
  const history = loadHistory();
  const input = promptInput.value.toLowerCase();
  if (input.length < 3) return;
  
  const suggestions = history
    .map(item => item.prompt)
    .filter(prompt => prompt.toLowerCase().includes(input))
    .slice(0, 5);
    
  // Show suggestions UI
  // ... (implementation details)
}

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + / to focus prompt input
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    promptInput.focus();
  }
  
  // Ctrl/Cmd + S to save current generation
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    // Save current generation logic
  }
});

function validatePrompt(prompt) {
  if (prompt.length < 3) return 'Prompt too short';
  if (prompt.length > 500) return 'Prompt too long';
  return null;
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-500/20 text-red-400 px-4 py-2 rounded-lg mt-4';
  errorDiv.textContent = message;
  document.querySelector('.container').appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function optimizeImage(container) {
  const img = container.querySelector('.generated-image');
  if (!img) return;
  
  // Add lazy loading
  img.loading = 'lazy';
  
  // Add progressive loading
  img.decoding = 'async';
  
  // Add error handling
  img.onerror = () => {
    container.innerHTML = '<div class="p-4 text-red-400">Failed to load image</div>';
  };
}

function openSettings() {
  const modal = document.getElementById('settingsModal');
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  modal.classList.remove('show');
  setTimeout(() => modal.classList.add('hidden'), 300);
}

function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  const body = document.body;
  
  // Remove all existing theme classes
  Object.values(THEMES).forEach(t => {
    body.classList.remove(...t.backgroundClasses);
    body.classList.remove(t.textClass);
  });
  
  // Apply new theme classes
  body.classList.add(...theme.backgroundClasses);
  body.classList.add(theme.textClass);
  
  // Update theme-cards
  document.querySelectorAll('.theme-card').forEach(card => {
    Object.values(THEMES).forEach(t => {
      card.classList.remove(`from-${t.accent}-600`, `to-${t.accent}-700`);
    });
    card.classList.add(`from-${theme.accent}-600`, `to-${theme.accent}-700`);
  });
  
  // Save theme preference
  localStorage.setItem('nexaTheme', themeKey);
}

function loadSettings() {
  // Load saved theme
  const savedTheme = localStorage.getItem('nexaTheme') || 'dark';
  applyTheme(savedTheme);
  document.querySelector(`[data-theme="${savedTheme}"]`).classList.add('ring-2');
  
  // Load other settings
  const settings = JSON.parse(localStorage.getItem('nexaSettings') || '{}');
  document.getElementById('showShortcuts').checked = settings.showShortcuts ?? true;
  document.getElementById('showTooltips').checked = settings.showTooltips ?? true;
  document.getElementById('useAnimations').checked = settings.useAnimations ?? true;
  
  applySettings(settings);
}

function saveSettings() {
  const settings = {
    showShortcuts: document.getElementById('showShortcuts').checked,
    showTooltips: document.getElementById('showTooltips').checked,
    useAnimations: document.getElementById('useAnimations').checked
  };
  
  localStorage.setItem('nexaSettings', JSON.stringify(settings));
  applySettings(settings);
}

function applySettings(settings) {
  // Apply shortcuts visibility
  document.querySelectorAll('.keyboard-shortcut').forEach(el => {
    el.style.display = settings.showShortcuts ? 'inline-flex' : 'none';
  });
  
  // Apply tooltips
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.classList.toggle('tooltip', settings.showTooltips);
  });
  
  // Apply animations
  document.body.classList.toggle('reduce-motion', !settings.useAnimations);
}

document.addEventListener('DOMContentLoaded', () => {
  setupPresets();
  setupAdvancedOptions();
  promptInput.addEventListener('input', suggestPrompts);
  
  // Add tooltip initialization
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(el => {
    el.addEventListener('mouseenter', () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs whitespace-nowrap';
      tooltip.textContent = el.dataset.tooltip;
      el.appendChild(tooltip);
    });
    
    el.addEventListener('mouseleave', () => {
      const tooltip = el.querySelector('.absolute');
      if (tooltip) tooltip.remove();
    });
  });
  
  // Add keyboard shortcuts info
  const shortcutsDiv = document.createElement('div');
  shortcutsDiv.className = 'mt-4 text-sm text-gray-400';
  shortcutsDiv.innerHTML = `
    <div class="flex items-center justify-center space-x-4">
      <span>Press <kbd class="px-2 py-1 bg-white/10 rounded">Tab</kbd> to cycle through options</span>
      <span>Press <kbd class="px-2 py-1 bg-white/10 rounded">Ctrl</kbd> + <kbd class="px-2 py-1 bg-white/10 rounded">/</kbd> to focus prompt</span>
    </div>
  `;
  document.querySelector('.container').appendChild(shortcutsDiv);
  
  loadSettings();
  
  // Add settings button event listener
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  
  // Add theme selection listeners
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('ring-2'));
      option.classList.add('ring-2');
      applyTheme(option.dataset.theme);
    });
  });
  
  // Add settings change listeners
  document.querySelectorAll('.setting-toggle').forEach(toggle => {
    toggle.addEventListener('change', saveSettings);
  });
});

function populateModelSelect() {
  const modelSelect = document.getElementById('modelSelect');
  modelSelect.innerHTML = ''; // Clear existing options
  
  Object.entries(modelConfigs).forEach(([key, config]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = config.name;
    if (config.censored) {
      option.classList.add('censored');
    }
    modelSelect.appendChild(option);
  });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', populateModelSelect);