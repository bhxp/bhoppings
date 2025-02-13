export class ChecklistManager {
  constructor(game) {
    this.game = game;
    this.createChecklistUI();
  }

  // Create the checklist UI using the existing modal from index.html
  createChecklistUI() {
    // Use the existing modal element instead of creating a duplicate overlay.
    const container = document.getElementById('modal');
    // Optionally add a distinguishing class if needed
    container.classList.add('checklist-modal');
    container.innerHTML = `
      <div class="modal-content">
        <h2>Object Check</h2>
        <div id="checklist-items"></div>
        <button id="close-checklist">Close</button>
      </div>
    `;
    this.container = container;
    this.setupEventListeners();
  }

  // Show checklist with current status
  showChecklist() {
    const items = this.game.objectManager.checkRequiredObjects();
    const container = document.getElementById('checklist-items');
    
    container.innerHTML = items.map(item => `
      <div class="checklist-item">
        <input type="checkbox" 
          id="check-${item.type}" 
          ${item.complete ? 'checked' : ''} 
          disabled
        >
        <label for="check-${item.type}">
          ${item.name} (${item.placed}/${item.required})
        </label>
      </div>
    `).join('');
    
    // Display the existing modal overlay
    this.container.classList.remove('hidden');
  }

  // Set up event listeners for the checklist modal
  setupEventListeners() {
    document.getElementById('close-checklist').addEventListener('click', () => {
      this.container.classList.add('hidden');
    });
  }
}