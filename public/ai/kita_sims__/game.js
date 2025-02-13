import { World } from './world.js';
import { GameState } from './gameState.js';
import { UIManager } from './uiManager.js';
import { EventManager } from './eventManager.js';
import { ObjectManager } from './objectManager.js';
import { NPCManager } from './npcManager.js';
import { InteractionManager } from './interactionManager.js';
import { ChecklistManager } from './checklistManager.js';

class Game {
  constructor() {
    this.state = new GameState();
    // Create UI early so that event callbacks (eg, showProgressModal) find it.
    this.ui = new UIManager();
    // IMPORTANT: Create the world first so that later managers (e.g. events) can safely refer to it.
    this.world = new World(this);
    this.events = new EventManager(this);
    this.objectManager = new ObjectManager(this.world);
    this.npcManager = new NPCManager(this.world);
    this.interactionManager = new InteractionManager(this.world);
    this.checklistManager = new ChecklistManager(this);
    
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    this.startGameLoop();
  }

  setupEventListeners() {
    document.getElementById('pause').addEventListener('click', () => this.togglePause());
    document.getElementById('speed-up').addEventListener('click', () => this.toggleSpeed());
    document.getElementById('build-mode').addEventListener('click', () => this.toggleBuildMode());
    document.getElementById('check-mode').addEventListener('click', () => this.toggleCheckMode());
    document.getElementById('objects-check').addEventListener('click', () => {
      this.checklistManager.showChecklist();
    });
    
    // Add mouse interaction for building
    document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  startGameLoop() {
    const gameLoop = () => {
      if (!this.state.isPaused) {
        this.update();
      }
      requestAnimationFrame(gameLoop);
    };
    gameLoop();
  }

  update() {
    if (!this.state.isPaused) {
      this.state.updateTime();
      this.world.update();
      this.events.checkForEvents();
      this.ui.updateDisplay(this.state);
      
      // Make sure NPCs are updated each frame
      this.npcManager.update();
    }
  }

  handleMouseDown(event) {
    if (this.state.isBuildMode) {
      const raycaster = this.world.raycaster;
      raycaster.setFromCamera(
        {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1
        },
        this.world.camera
      );
      
      const intersection = this.world.voxelWorld.raycast(raycaster);
      
      if (intersection) {
        if (event.button === 0) { // Left click
          const pos = intersection.position.map(p => Math.floor(p));
          this.world.voxelWorld.setVoxel(
            pos[0],
            pos[1], 
            pos[2],
            this.state.selectedVoxelType || 3
          );
        } else if (event.button === 2) { // Right click
          const pos = intersection.position.map(p => Math.floor(p));
          this.world.voxelWorld.setVoxel(
            pos[0],
            pos[1],
            pos[2],
            0
          );
        }
      }
    }
  }

  handleMouseMove(event) {
    if (this.state.isBuildMode) {
      const raycaster = this.world.raycaster;
      raycaster.setFromCamera(
        {
          x: (event.clientX / window.innerWidth) * 2 - 1,
          y: -(event.clientY / window.innerHeight) * 2 + 1
        },
        this.world.camera
      );
      
      const intersection = this.world.voxelWorld.raycast(raycaster);
      
      if (intersection) {
        this.ui.showBuildPreview(intersection.position);
      } else {
        this.ui.hideBuildPreview();
      }
    }
  }

  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    this.ui.updatePauseButton();
  }

  toggleSpeed() {
    this.state.toggleGameSpeed();
    this.ui.updateSpeedButton();
  }

  toggleBuildMode() {
    this.state.isBuildMode = !this.state.isBuildMode;
    this.world.setBuildMode(this.state.isBuildMode);
    this.ui.updateBuildButton();
  }

  toggleCheckMode() {
    this.state.isCheckMode = !this.state.isCheckMode;
    this.world.setCheckMode(this.state.isCheckMode);
    this.ui.updateCheckButton();
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  window.game = new Game();
});