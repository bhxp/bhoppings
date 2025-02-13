export class UIManager {
  constructor() {
    this.budgetElement = document.querySelector('#budget span');
    this.experienceElement = document.querySelector('#experience span');
    this.timeElement = document.querySelector('#time span:last-child');
    this.dayElement = document.querySelector('#time span:first-child');
    this.modal = document.getElementById('modal');
    this.modalContent = document.getElementById('modal-content');
    
    // Bind methods that are used as callbacks
    this.handleModalClose = this.handleModalClose.bind(this);
    this.showProgressModal = this.showProgressModal.bind(this);
    
    // Initialize event listeners
    this.initializeEventListeners();
    
    this.selectedNPC = null;
    this.currentProgressInterval = null;
    this.initializeSimsUI();
  }

  initializeEventListeners() {
    document.addEventListener('click', e => {
      if (e.target.id === 'modal-close') {
        this.handleModalClose();
      }
    });
  }

  initializeSimsUI() {
    this.createNeedsPanel();
    this.createRelationshipPanel();
    this.createNotificationSystem();
    this.initializeTooltips();
  }

  createNeedsPanel() {
    const needsPanel = document.createElement('div');
    needsPanel.className = 'needs-panel';
    needsPanel.innerHTML = `
      <div class="need-hunger need-bar">
        <div class="need-bar-fill"></div>
        <span>Hunger</span>
      </div>
      <div class="need-energy need-bar">
        <div class="need-bar-fill"></div>
        <span>Energy</span>
      </div>
      <div class="need-social need-bar">
        <div class="need-bar-fill"></div>
        <span>Social</span>
      </div>
      <div class="need-fun need-bar">
        <div class="need-bar-fill"></div>
        <span>Fun</span>
      </div>
      <div class="need-hygiene need-bar">
        <div class="need-bar-fill"></div>
        <span>Hygiene</span>
      </div>
    `;
    document.body.appendChild(needsPanel);
  }

  createRelationshipPanel() {
    const relationshipPanel = document.createElement('div');
    relationshipPanel.className = 'relationship-panel hidden';
    document.body.appendChild(relationshipPanel);
  }

  createNotificationSystem() {
    this.notificationQueue = [];
    this.currentNotification = null;
  }

  updateDisplay(gameState) {
    this.budgetElement.textContent = gameState.budget.toLocaleString();
    this.experienceElement.textContent = gameState.experience;
    this.timeElement.textContent = gameState.getTimeString();
    this.dayElement.textContent = gameState.day;
  }

  showEventModal(event) {
    this.modalContent.innerHTML = `
      <h2>${event.title}</h2>
      <p>${event.description}</p>
      <button id="modal-close">Got it</button>
    `;
    this.modal.classList.remove('hidden');
  }

  showProgressModal(step) {
    const modalContent = document.createElement('div');
    modalContent.className = 'progress-modal';
    modalContent.innerHTML = `
      <h3>${step.title}</h3>
      <p>${step.description}</p>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <p class="progress-time">Time remaining: ${step.requiredTime} seconds</p>
    `;
    this.modalContent.innerHTML = '';
    this.modalContent.appendChild(modalContent);
    this.modal.classList.remove('hidden');

    const progressFill = modalContent.querySelector('.progress-fill');
    const progressTime = modalContent.querySelector('.progress-time');
    let timeLeft = step.requiredTime;
    const updateProgress = () => {
      if (timeLeft <= 0) {
        clearInterval(progressInterval);
        return;
      }
      timeLeft--;
      const progress = ((step.requiredTime - timeLeft) / step.requiredTime) * 100;
      progressFill.style.width = `${progress}%`;
      progressTime.textContent = `Time remaining: ${timeLeft} seconds`;
    };
    const progressInterval = setInterval(updateProgress, 1000);
    this.currentProgressInterval = progressInterval;
  }

  clearProgressInterval() {
    if (this.currentProgressInterval) {
      clearInterval(this.currentProgressInterval);
      this.currentProgressInterval = null;
    }
  }

  handleModalClose() {
    this.modal.classList.add('hidden');
    this.clearProgressInterval();
  }

  updatePauseButton() {
    const btn = document.getElementById('pause');
    btn.textContent = window.game.state.isPaused ? '▶️' : '⏸️';
  }

  updateSpeedButton() {
    const btn = document.getElementById('speed-up');
    const speed = window.game.state.gameSpeed;
    btn.textContent = '⏩'.repeat(speed);
  }

  updateBuildButton() {
    const btn = document.getElementById('build-mode');
    btn.classList.toggle('active', window.game.state.isBuildMode);
  }

  updateCheckButton() {
    const btn = document.getElementById('check-mode');
    btn.classList.toggle('active', window.game.state.isCheckMode);
  }

  showNotification(message, type = 'info', duration = 3000) {
    const notification = { message, type, duration };
    this.notificationQueue.push(notification);
    if (!this.currentNotification) {
      this.showNextNotification();
    }
  }

  showNextNotification() {
    if (this.notificationQueue.length === 0) {
      this.currentNotification = null;
      return;
    }
    const notification = this.notificationQueue.shift();
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type}`;
    element.textContent = notification.message;
    document.body.appendChild(element);
    setTimeout(() => {
      element.remove();
      this.showNextNotification();
    }, notification.duration);
    this.currentNotification = element;
  }

  updateNeedsDisplay(npc) {
    if (!npc) return;
    Object.entries(npc.needs).forEach(([need, value]) => {
      const bar = document.querySelector(`.need-${need} .need-bar-fill`);
      if (bar) {
        bar.style.width = `${value}%`;
        bar.className = 'need-bar-fill';
        if (value < 25) bar.classList.add('critical');
        else if (value < 50) bar.classList.add('warning');
      }
    });
  }

  updateRelationshipPanel(npc) {
    if (!npc) return;
    const panel = document.querySelector('.relationship-panel');
    panel.innerHTML = '';
    npc.relationships.forEach((level, otherNPC) => {
      const relationshipItem = document.createElement('div');
      relationshipItem.className = 'relationship-item';
      const icon = level > 0 ? '❤️' : '💔';
      const barClass = level > 0 ? 'positive' : 'negative';
      relationshipItem.innerHTML = `
        <span class="relationship-icon">${icon}</span>
        <div>
          <div>${otherNPC}</div>
          <div class="relationship-bar">
            <div class="relationship-level ${barClass}" 
                 style="width: ${Math.abs(level)}%"></div>
          </div>
        </div>
      `;
      panel.appendChild(relationshipItem);
    });
    panel.classList.remove('hidden');
  }

  showThoughtBubble(npc, thought) {
    const bubble = document.createElement('div');
    bubble.className = 'thought-bubble';
    bubble.textContent = thought;
    document.body.appendChild(bubble);
    this.updateBubblePosition(npc, bubble);
    setTimeout(() => bubble.remove(), 3000);
  }

  showEmotionParticles(position, emotion) {
    const particles = document.createElement('div');
    particles.className = 'emotion-particles';
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'emotion-particle';
      particle.textContent = this.getEmotionEmoji(emotion);
      particle.style.left = `${Math.random() * 40 - 20}px`;
      particles.appendChild(particle);
    }
    document.body.appendChild(particles);
    this.updateParticlePosition(position, particles);
    setTimeout(() => particles.remove(), 1000);
  }

  getEmotionEmoji(emotion) {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      excited: '🤩',
      tired: '😴',
      hungry: '🍽️'
    };
    return emojis[emotion] || '😐';
  }

  updateBubblePosition(npc, bubble) {
    // Implement the logic to position the bubble above the NPC.
  }

  updateParticlePosition(position, particles) {
    // Implement the logic to position particles near the given coordinate.
  }

  initializeTooltips() {
    // Implement tooltip initialization if needed.
  }

  setGameSpeed(speed) {
    // Implement if required.
  }
}