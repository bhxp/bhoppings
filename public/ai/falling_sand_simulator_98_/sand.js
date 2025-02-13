let CELL_SIZE = 4;
let GRID_WIDTH, GRID_HEIGHT;

const PARTICLE_TYPES = {
  EMPTY: 0,
  SAND: 1,
  WATER: 2,
  GLASS: 3,
  GRASS_SEED: 4,
  GRASS: 5,
  ALGAE: 6,
  FIRE: 7,
  SMOKE: 8,
  OIL: 9,
  ACID: 10,
  FISH: 11
};

// Base colors for each particle type
const BASE_COLORS = {
  [PARTICLE_TYPES.EMPTY]: '#000000',
  [PARTICLE_TYPES.SAND]: { h: 42, s: 65, l: 73 },
  [PARTICLE_TYPES.WATER]: { h: 210, s: 80, l: 60, a: 0.5 },
  [PARTICLE_TYPES.GLASS]: { h: 190, s: 40, l: 80, a: 0.4 },
  [PARTICLE_TYPES.GRASS_SEED]: { h: 120, s: 70, l: 35 },
  [PARTICLE_TYPES.GRASS]: { h: 120, s: 70, l: 45 },
  [PARTICLE_TYPES.ALGAE]: { h: 150, s: 60, l: 30, a: 0.8 },
  [PARTICLE_TYPES.FIRE]: { h: 20, s: 100, l: 50, a: 0.8 },
  [PARTICLE_TYPES.SMOKE]: { h: 0, s: 0, l: 40, a: 0.3 },
  [PARTICLE_TYPES.OIL]: { h: 40, s: 100, l: 20, a: 0.7 },
  [PARTICLE_TYPES.ACID]: { h: 110, s: 100, l: 50, a: 0.6 },
  [PARTICLE_TYPES.FISH]: { h: 30, s: 80, l: 60 }
};

class SandSimulator {
  constructor() {
    // Initialize base properties
    this.simulationSpeed = 1;
    this.gravityStrength = 1;
    this.waterFlowRate = 1;
    this.reactionChance = 0.2;

    this.canvas = document.getElementById('sandCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Color variation maps store the specific color for each particle
    this.colorVariations = new Map();
    
    // Initialize canvas
    this.initializeCanvas();
    
    window.addEventListener('resize', () => {
      this.initializeCanvas();
    });
    
    this.selectedType = PARTICLE_TYPES.SAND;
    this.isDrawing = false;
    this.setupEventListeners();
    
    // Add growthStages map to track grass growth
    this.growthStages = new Map();
    this.lastGrowthUpdate = Date.now();
    this.growthInterval = 1000; // 1 second between growth attempts
    
    this.brushSize = 3; // Initial brush size
    this.maxBrushSize = 20;
    this.minBrushSize = 1;
    
    // Create cursor preview element
    this.cursorPreview = document.createElement('div');
    this.cursorPreview.className = 'cursor-preview';
    document.querySelector('.container').appendChild(this.cursorPreview);
    
    this.updateCursorPreview({ clientX: 0, clientY: 0 });
    
    // Add default values for advanced settings
    this.fluidViscosity = 5;
    this.reactionRate = 5;
    this.enableEdgeWrap = true;
    this.enableThermalEffects = false;
    this.enablePressure = false;
    
    // Initialize temperature tracking
    this.glassTemperature = new Map();
    
    // Initialize advanced settings from localStorage if available
    this.loadAdvancedSettings();
    
    // Apply initial settings
    this.applyAdvancedSettings();
    
    // Add presets management
    this.presets = new Map();
    this.loadPresetsFromStorage();
    
    // Add preset button to controls
    const controlsGrid = document.querySelector('.button-grid');
    const presetBtn = document.createElement('button');
    presetBtn.id = 'presetBtn';
    presetBtn.textContent = 'Presets';
    controlsGrid.appendChild(presetBtn);
    
    this.setupPresetsEventListeners();
    
    // Initialize presets window state from localStorage
    const presetsOpen = localStorage.getItem('presetsOpen') === 'true';
    document.querySelector('.presets-window').style.display = presetsOpen ? 'block' : 'none';

    // Start update loop
    this.update();
  }

  getRandomColor(type) {
    const base = BASE_COLORS[type];
    if (type === PARTICLE_TYPES.EMPTY) return base;
    
    if (type === PARTICLE_TYPES.GLASS || type === PARTICLE_TYPES.WATER) {
      const hVar = (Math.random() - 0.5) * 10;
      const sVar = (Math.random() - 0.5) * 10;
      const lVar = (Math.random() - 0.5) * 10;
      return `hsla(${base.h + hVar}, ${base.s + sVar}%, ${base.l + lVar}%, ${base.a})`;
    }
    
    // Add variations for grass and algae
    if (type === PARTICLE_TYPES.GRASS || type === PARTICLE_TYPES.GRASS_SEED || type === PARTICLE_TYPES.ALGAE) {
      const hVar = (Math.random() - 0.5) * 15;
      const sVar = (Math.random() - 0.5) * 20;
      const lVar = (Math.random() - 0.5) * 15;
      const alpha = type === PARTICLE_TYPES.ALGAE ? base.a : 1;
      return `hsla(${base.h + hVar}, ${base.s + sVar}%, ${base.l + lVar}%, ${alpha})`;
    }
    
    // Add variations for sand
    const hVar = (Math.random() - 0.5) * 20;
    const sVar = (Math.random() - 0.5) * 15;
    const lVar = (Math.random() - 0.5) * 15;
    
    return `hsl(${base.h + hVar}, ${base.s + sVar}%, ${base.l + lVar}%)`;
  }

  initializeCanvas() {
    // Set canvas size to window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Calculate grid dimensions
    GRID_WIDTH = Math.ceil(window.innerWidth / CELL_SIZE);
    GRID_HEIGHT = Math.ceil(window.innerHeight / CELL_SIZE);
    
    // Create new grid
    this.grid = Array(GRID_WIDTH * GRID_HEIGHT).fill(PARTICLE_TYPES.EMPTY);
    
    // Draw sphere in center
    this.drawHollowSphere(GRID_WIDTH / 2, GRID_HEIGHT / 2, Math.min(GRID_WIDTH, GRID_HEIGHT) / 4);
  }

  getIndex(x, y) {
    return y * GRID_WIDTH + x;
  }

  setCell(x, y, type) {
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      const index = this.getIndex(x, y);
      this.grid[index] = type;
      
      // Assign a random color variation when creating a new particle
      if (type !== PARTICLE_TYPES.EMPTY) {
        this.colorVariations.set(index, this.getRandomColor(type));
      } else {
        this.colorVariations.delete(index);
      }
    }
  }

  getCell(x, y) {
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
      return this.grid[this.getIndex(x, y)];
    }
    // Remove floor, only make sides and top solid glass
    if (x < 0 || x >= GRID_WIDTH || y < 0) {
      return PARTICLE_TYPES.GLASS;
    }
    // Bottom is now void - particles will fall through
    return PARTICLE_TYPES.EMPTY;
  }

  updateParticle(x, y) {
    const type = this.getCell(x, y);
    const gravityChance = this.gravityStrength || 1;
    
    // Only apply gravity if random check passes
    if (Math.random() > gravityChance) return;
    
    if (type === PARTICLE_TYPES.GRASS_SEED) {
      // If there's sand below, start growing
      if (this.getCell(x, y + 1) === PARTICLE_TYPES.SAND) {
        const index = this.getIndex(x, y);
        if (!this.growthStages.has(index)) {
          this.growthStages.set(index, 0);
        }
      } else if (this.getCell(x, y + 1) === PARTICLE_TYPES.EMPTY) {
        // Fall if nothing below
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(x, y + 1, PARTICLE_TYPES.GRASS_SEED);
      }
    } else if (type === PARTICLE_TYPES.SAND || type === PARTICLE_TYPES.ALGAE) {
      // Check if particle should fall off screen
      if (y + 1 >= GRID_HEIGHT) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        return;
      }
      
      // Special behavior for algae in water
      if (type === PARTICLE_TYPES.ALGAE) {
        // If surrounded by water, start floating and spreading
        const isInWater = [
          this.getCell(x, y + 1) === PARTICLE_TYPES.WATER,
          this.getCell(x, y - 1) === PARTICLE_TYPES.WATER,
          this.getCell(x + 1, y) === PARTICLE_TYPES.WATER,
          this.getCell(x - 1, y) === PARTICLE_TYPES.WATER
        ].filter(Boolean).length >= 2;

        if (isInWater) {
          // Slow down movement even more by reducing probability from 0.2 to 0.05
          if (Math.random() < 0.05) { 
            const directions = [
              [0, -1], // up
              [1, 0],  // right
              [-1, 0], // left
              [0, 1]   // down
            ];
            
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            const newX = x + randomDir[0];
            const newY = y + randomDir[1];
            
            if (this.getCell(newX, newY) === PARTICLE_TYPES.WATER) {
              this.setCell(x, y, PARTICLE_TYPES.WATER);
              this.setCell(newX, newY, PARTICLE_TYPES.ALGAE);
            }
          }

          // Slow down spread rate even more by reducing probability from 0.02 to 0.005
          if (Math.random() < 0.005) { 
            const directions = [
              [0, -1], [1, 0], [-1, 0], [0, 1]
            ];
            // Reduce spread probability from 0.15 to 0.08
            const spreadDirs = directions.filter(() => Math.random() < 0.08); 
            for (const [dx, dy] of spreadDirs) {
              const spreadX = x + dx;
              const spreadY = y + dy;
              if (this.getCell(spreadX, spreadY) === PARTICLE_TYPES.WATER) {
                this.setCell(spreadX, spreadY, PARTICLE_TYPES.ALGAE);
              }
            }
          }
          
          return;
        }
      }
      
      // Normal powder behavior
      if (this.getCell(x, y + 1) === PARTICLE_TYPES.EMPTY || this.getCell(x, y + 1) === PARTICLE_TYPES.WATER) {
        const displacedType = this.getCell(x, y + 1);
        this.setCell(x, y, displacedType);
        this.setCell(x, y + 1, type);
      }
      else if (this.getCell(x - 1, y + 1) === PARTICLE_TYPES.EMPTY || this.getCell(x - 1, y + 1) === PARTICLE_TYPES.WATER) {
        const displacedType = this.getCell(x - 1, y + 1);
        this.setCell(x, y, displacedType);
        this.setCell(x - 1, y + 1, type);
      }
      else if (this.getCell(x + 1, y + 1) === PARTICLE_TYPES.EMPTY || this.getCell(x + 1, y + 1) === PARTICLE_TYPES.WATER) {
        const displacedType = this.getCell(x + 1, y + 1);
        this.setCell(x, y, displacedType);
        this.setCell(x + 1, y + 1, type);
      }
      
    } else if (type === PARTICLE_TYPES.WATER) {
      // Check if water should fall off screen
      if (y + 1 >= GRID_HEIGHT) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        return;
      }
      
      let moved = false;
      
      if (this.getCell(x, y + 1) === PARTICLE_TYPES.EMPTY) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(x, y + 1, PARTICLE_TYPES.WATER);
        moved = true;
      }
      
      if (!moved) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        if (this.getCell(x + direction, y) === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x + direction, y, PARTICLE_TYPES.WATER);
        } else if (this.getCell(x - direction, y) === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x - direction, y, PARTICLE_TYPES.WATER);
        }
      }
    } else if (type === PARTICLE_TYPES.FIRE) {
      // Fire rises and has a chance to spread or extinguish
      if (Math.random() < 0.1) {
        this.setCell(x, y, PARTICLE_TYPES.SMOKE);
        return;
      }
      
      // Try to move up and slightly to the sides
      const directions = [[0, -1], [-1, -1], [1, -1]];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      const newX = x + randomDir[0];
      const newY = y + randomDir[1];
      
      if (this.getCell(newX, newY) === PARTICLE_TYPES.EMPTY) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(newX, newY, PARTICLE_TYPES.FIRE);
      }
      
      // Spread fire to nearby flammable materials
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (Math.random() < 0.1) {
            const targetType = this.getCell(x + dx, y + dy);
            if (targetType === PARTICLE_TYPES.OIL || targetType === PARTICLE_TYPES.GRASS) {
              this.setCell(x + dx, y + dy, PARTICLE_TYPES.FIRE);
            }
          }
        }
      }
    } else if (type === PARTICLE_TYPES.SMOKE) {
      // Smoke rises and dissipates
      if (Math.random() < 0.02) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        return;
      }
      
      const directions = [[0, -1], [-1, -1], [1, -1]];
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      const newX = x + randomDir[0];
      const newY = y + randomDir[1];
      
      if (this.getCell(newX, newY) === PARTICLE_TYPES.EMPTY) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(newX, newY, PARTICLE_TYPES.SMOKE);
      }
    } else if (type === PARTICLE_TYPES.OIL) {
      // Oil floats on water and acts like a liquid
      if (y + 1 >= GRID_HEIGHT) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        return;
      }
      
      const below = this.getCell(x, y + 1);
      if (below === PARTICLE_TYPES.EMPTY) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(x, y + 1, PARTICLE_TYPES.OIL);
      } else if (below === PARTICLE_TYPES.WATER) {
        // Oil floats on water by swapping positions
        this.setCell(x, y, PARTICLE_TYPES.WATER);
        this.setCell(x, y + 1, PARTICLE_TYPES.OIL);
      } else {
        // Try to move sideways if blocked below
        const direction = Math.random() < 0.5 ? -1 : 1;
        const sideCell = this.getCell(x + direction, y);
        
        if (sideCell === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x + direction, y, PARTICLE_TYPES.OIL);
        } else if (sideCell === PARTICLE_TYPES.WATER) {
          // Also float sideways if next to water
          this.setCell(x, y, PARTICLE_TYPES.WATER);
          this.setCell(x + direction, y, PARTICLE_TYPES.OIL);
        } else if (this.getCell(x - direction, y) === PARTICLE_TYPES.EMPTY) {
          // Try the other direction if first direction is blocked
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x - direction, y, PARTICLE_TYPES.OIL);
        } else if (this.getCell(x - direction, y) === PARTICLE_TYPES.WATER) {
          this.setCell(x, y, PARTICLE_TYPES.WATER);
          this.setCell(x - direction, y, PARTICLE_TYPES.OIL);
        }
      }
    } else if (type === PARTICLE_TYPES.ACID) {
      // Acid falls and dissolves materials it touches
      if (y + 1 >= GRID_HEIGHT) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        return;
      }
      
      // Dissolve materials it touches (except glass)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const targetType = this.getCell(x + dx, y + dy);
          if (targetType !== PARTICLE_TYPES.EMPTY && 
              targetType !== PARTICLE_TYPES.ACID && 
              targetType !== PARTICLE_TYPES.GLASS) {
            if (Math.random() < 0.2) {
              this.setCell(x + dx, y + dy, PARTICLE_TYPES.EMPTY);
              if (Math.random() < 0.3) { // Acid has a chance to be consumed
                this.setCell(x, y, PARTICLE_TYPES.EMPTY);
                return;
              }
            }
          }
        }
      }
      
      // Move like a liquid
      if (this.getCell(x, y + 1) === PARTICLE_TYPES.EMPTY) {
        this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        this.setCell(x, y + 1, PARTICLE_TYPES.ACID);
      } else {
        const direction = Math.random() < 0.5 ? -1 : 1;
        if (this.getCell(x + direction, y) === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x + direction, y, PARTICLE_TYPES.ACID);
        }
      }
    } else if (type === PARTICLE_TYPES.GLASS) {
      // Get the current temperature
      const index = this.getIndex(x, y);
      let temp = this.glassTemperature.get(index) || 0;
      
      // Check for nearby fire
      let nearbyFire = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (this.getCell(x + dx, y + dy) === PARTICLE_TYPES.FIRE) {
            nearbyFire = true;
            break;
          }
        }
      }
      
      // Update temperature
      if (nearbyFire) {
        temp = Math.min(1, temp + 0.1); // Heat up
      } else {
        temp = Math.max(0, temp - 0.05); // Cool down
      }
      
      // Update or delete temperature
      if (temp > 0) {
        this.glassTemperature.set(index, temp);
      } else {
        this.glassTemperature.delete(index);
      }
    } else if (type === PARTICLE_TYPES.FISH) {
      // Fish behavior
      let isInWater = false;
      
      // Check if fish is surrounded by water
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (this.getCell(x + dx, y + dy) === PARTICLE_TYPES.WATER) {
            isInWater = true;
            break;
          }
        }
      }
      
      // If not in water, fall down
      if (!isInWater) {
        if (this.getCell(x, y + 1) === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
          this.setCell(x, y + 1, PARTICLE_TYPES.FISH);
        }
        return;
      }

      // Look for nearby algae within detection range
      const detectionRange = 5;
      let nearestAlgae = null;
      let shortestDistance = Infinity;

      // Scan for nearby algae
      for (let dy = -detectionRange; dy <= detectionRange; dy++) {
        for (let dx = -detectionRange; dx <= detectionRange; dx++) {
          const checkX = x + dx;
          const checkY = y + dy;
          if (this.getCell(checkX, checkY) === PARTICLE_TYPES.ALGAE) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < shortestDistance) {
              shortestDistance = distance;
              nearestAlgae = { x: checkX, y: checkY };
            }
          }
        }
      }

      // Movement behavior
      if (Math.random() < 0.2) { // Only move sometimes to make movement less erratic
        let dx = 0;
        let dy = 0;

        if (nearestAlgae) {
          // Move towards nearest algae
          dx = Math.sign(nearestAlgae.x - x);
          dy = Math.sign(nearestAlgae.y - y);
        } else {
          // Random movement with upward bias when no algae is nearby
          const directions = [
            [0, -1], // up
            [0, -1], // up (weighted)
            [1, 0],  // right
            [-1, 0], // left
            [0, 1]   // down
          ];
          
          // Add horizontal bias based on position
          if (x < GRID_WIDTH / 2) {
            directions.push([1, 0]); // bias right
          } else {
            directions.push([-1, 0]); // bias left
          }
          
          [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        }

        const newX = x + dx;
        const newY = y + dy;
        
        // Only move if target cell is water
        if (this.getCell(newX, newY) === PARTICLE_TYPES.WATER) {
          this.setCell(x, y, PARTICLE_TYPES.WATER);
          this.setCell(newX, newY, PARTICLE_TYPES.FISH);
        }
      }

      // Feed on algae when adjacent
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (this.getCell(x + dx, y + dy) === PARTICLE_TYPES.ALGAE) {
            if (Math.random() < 0.4) { // Increased chance to eat algae
              this.setCell(x + dx, y + dy, PARTICLE_TYPES.WATER);
            }
          }
        }
      }
    }
  }

  update() {
    // Handle grass growth
    const currentTime = Date.now();
    if (currentTime - this.lastGrowthUpdate > this.growthInterval) {
      this.growGrass();
      this.lastGrowthUpdate = currentTime;
    }

    const speed = this.simulationSpeed || 1;
    for (let i = 0; i < speed; i++) {
      for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        const rowStart = y % 2 === 0 ? 0 : GRID_WIDTH - 1;
        const rowEnd = y % 2 === 0 ? GRID_WIDTH : -1;
        const step = y % 2 === 0 ? 1 : -1;
        
        for (let x = rowStart; x !== rowEnd; x += step) {
          this.updateParticle(x, y);
        }
      }
    }
    
    this.draw();
    requestAnimationFrame(() => this.update());
  }

  growGrass() {
    for (const [indexStr, stage] of this.growthStages.entries()) {
      const index = parseInt(indexStr);
      const x = index % GRID_WIDTH;
      const y = Math.floor(index / GRID_WIDTH);
      
      if (this.getCell(x, y) === PARTICLE_TYPES.GRASS_SEED && 
          this.getCell(x, y + 1) === PARTICLE_TYPES.SAND) {
        
        if (stage < 3 && this.getCell(x, y - stage - 1) === PARTICLE_TYPES.EMPTY) {
          this.setCell(x, y - stage - 1, PARTICLE_TYPES.GRASS);
          this.growthStages.set(index, stage + 1);
        }
      } else {
        // Remove tracking if seed is gone or sand below is gone
        this.growthStages.delete(index);
      }
    }
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDrawing = true;
      this.handleDraw(e);
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.updateCursorPreview(e);
      if (this.isDrawing) {
        this.handleDraw(e);
      }
    });
    
    this.canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
    
    document.getElementById('sandBtn').addEventListener('click', () => this.setActiveButton('sandBtn', PARTICLE_TYPES.SAND));
    document.getElementById('waterBtn').addEventListener('click', () => this.setActiveButton('waterBtn', PARTICLE_TYPES.WATER));
    document.getElementById('wallBtn').addEventListener('click', () => this.setActiveButton('wallBtn', PARTICLE_TYPES.GLASS));
    document.getElementById('eraseBtn').addEventListener('click', () => this.setActiveButton('eraseBtn', PARTICLE_TYPES.EMPTY));
    document.getElementById('clearBtn').addEventListener('click', () => this.clearGrid());
    document.getElementById('seedBtn').addEventListener('click', () => this.setActiveButton('seedBtn', PARTICLE_TYPES.GRASS_SEED));
    document.getElementById('algaeBtn').addEventListener('click', () => this.setActiveButton('algaeBtn', PARTICLE_TYPES.ALGAE));
    document.getElementById('fireBtn').addEventListener('click', () => this.setActiveButton('fireBtn', PARTICLE_TYPES.FIRE));
    document.getElementById('smokeBtn').addEventListener('click', () => this.setActiveButton('smokeBtn', PARTICLE_TYPES.SMOKE));
    document.getElementById('oilBtn').addEventListener('click', () => this.setActiveButton('oilBtn', PARTICLE_TYPES.OIL));
    document.getElementById('acidBtn').addEventListener('click', () => this.setActiveButton('acidBtn', PARTICLE_TYPES.ACID));
    document.getElementById('fishBtn').addEventListener('click', () => this.setActiveButton('fishBtn', PARTICLE_TYPES.FISH));
    
    // Add wheel event listener for brush size
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      this.brushSize = Math.max(this.minBrushSize, Math.min(this.maxBrushSize, this.brushSize + delta));
      this.updateCursorPreview(e);
    });
    
    // Hide cursor preview when mouse leaves canvas
    this.canvas.addEventListener('mouseleave', () => {
      this.cursorPreview.style.display = 'none';
    });
    
    // Show cursor preview when mouse enters canvas
    this.canvas.addEventListener('mouseenter', (e) => {
      this.cursorPreview.style.display = 'block';
      this.updateCursorPreview(e);
    });
    
    // Settings window controls
    document.getElementById('settingsBtn').addEventListener('click', () => {
      const settingsWindow = document.querySelector('.settings-window');
      settingsWindow.style.display = 'block';
      // Save settings window state
      localStorage.setItem('settingsOpen', 'true');
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
      document.querySelector('.settings-window').style.display = 'none';
      localStorage.setItem('settingsOpen', 'false');
    });
    
    document.getElementById('cancelSettings').addEventListener('click', () => {
      document.querySelector('.settings-window').style.display = 'none';
      localStorage.setItem('settingsOpen', 'false');
      // Reset form to current values
      this.resetSettingsForm();
    });
    
    document.getElementById('applySettings').addEventListener('click', () => {
      this.applySettings();
      document.querySelector('.settings-window').style.display = 'none';
      localStorage.setItem('settingsOpen', 'false');
    });
    
    // Initialize settings window state from localStorage
    const settingsOpen = localStorage.getItem('settingsOpen') === 'true';
    document.querySelector('.settings-window').style.display = settingsOpen ? 'block' : 'none';
    
    // Add tab switching logic
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        button.classList.add('active');
        document.querySelector(`.tab-content[data-tab="${tabName}"]`).classList.add('active');
      });
    });
  }

  setupPresetsEventListeners() {
    document.getElementById('presetBtn').addEventListener('click', () => {
      const presetsWindow = document.querySelector('.presets-window');
      presetsWindow.style.display = presetsWindow.style.display === 'block' ? 'none' : 'block';
      // Save presets window state
      localStorage.setItem('presetsOpen', presetsWindow.style.display === 'block');
    });

    document.getElementById('closePresets').addEventListener('click', () => {
      document.querySelector('.presets-window').style.display = 'none';
      localStorage.setItem('presetsOpen', 'false');
    });

    document.getElementById('savePreset').addEventListener('click', () => {
      const name = document.getElementById('presetName').value.trim();
      if (name) {
        this.savePreset(name);
        document.getElementById('presetName').value = '';
      }
    });

    document.getElementById('loadPreset').addEventListener('click', () => {
      const select = document.getElementById('presetList');
      const name = select.value;
      if (name) {
        this.loadPreset(name);
      }
    });

    document.getElementById('deletePreset').addEventListener('click', () => {
      const select = document.getElementById('presetList');
      const name = select.value;
      if (name) {
        this.deletePreset(name);
      }
    });
  }

  loadAdvancedSettings() {
    this.fluidViscosity = parseInt(localStorage.getItem('fluidViscosity')) || 5;
    this.reactionRate = parseInt(localStorage.getItem('reactionRate')) || 5;
    this.enableEdgeWrap = localStorage.getItem('enableEdgeWrap') !== 'false';
    this.enableThermalEffects = localStorage.getItem('enableThermalEffects') === 'true';
    this.enablePressure = localStorage.getItem('enablePressure') === 'true';
    
    // Update UI
    document.getElementById('fluidViscosity').value = this.fluidViscosity;
    document.getElementById('reactionRate').value = this.reactionRate;
    document.getElementById('enableEdgeWrap').checked = this.enableEdgeWrap;
    document.getElementById('enableThermalEffects').checked = this.enableThermalEffects;
    document.getElementById('enablePressure').checked = this.enablePressure;
  }

  applySettings() {
    const newCellSize = parseInt(document.getElementById('cellSize').value);
    const simSpeed = parseInt(document.getElementById('simSpeed').value);
    const gravity = document.querySelector('input[name="gravity"]:checked').value;
    
    // Store old values
    const oldCellSize = CELL_SIZE;
    
    // Update cell size
    if (newCellSize !== oldCellSize) {
      CELL_SIZE = newCellSize;
      this.initializeCanvas();
    }
    
    // Update simulation speed
    const speeds = {1: 1, 2: 2, 3: 3};
    this.simulationSpeed = speeds[simSpeed];
    
    // Update gravity strength
    const gravityStrengths = {
      'low': 0.5,
      'normal': 1,
      'high': 2
    };
    this.gravityStrength = gravityStrengths[gravity];
    
    // Add advanced settings
    this.fluidViscosity = parseInt(document.getElementById('fluidViscosity').value);
    this.reactionRate = parseInt(document.getElementById('reactionRate').value);
    this.enableEdgeWrap = document.getElementById('enableEdgeWrap').checked;
    this.enableThermalEffects = document.getElementById('enableThermalEffects').checked;
    this.enablePressure = document.getElementById('enablePressure').checked;
    
    // Save advanced settings to localStorage
    localStorage.setItem('fluidViscosity', this.fluidViscosity);
    localStorage.setItem('reactionRate', this.reactionRate);
    localStorage.setItem('enableEdgeWrap', this.enableEdgeWrap);
    localStorage.setItem('enableThermalEffects', this.enableThermalEffects);
    localStorage.setItem('enablePressure', this.enablePressure);
    
    // Apply the effects of advanced settings
    this.applyAdvancedSettings();
  }

  applyAdvancedSettings() {
    // Modify fluid behavior based on viscosity
    if (this.fluidViscosity > 5) {
      // Slow down fluid movement
      this.waterFlowRate = 0.5;
    } else {
      // Speed up fluid movement
      this.waterFlowRate = 1.5;
    }
    
    // Modify reaction rates for fire, acid, etc.
    const baseReactionChance = 0.2;
    this.reactionChance = baseReactionChance * (this.reactionRate / 5);
    
    // Update edge behavior
    if (this.enableEdgeWrap) {
      // Modify getCell to wrap around edges
      this.getCell = (x, y) => {
        if (y >= GRID_HEIGHT) return PARTICLE_TYPES.EMPTY;
        x = ((x % GRID_WIDTH) + GRID_WIDTH) % GRID_WIDTH;
        if (y < 0) return PARTICLE_TYPES.GLASS;
        return this.grid[this.getIndex(x, y)];
      };
    } else {
      // Restore original getCell behavior
      this.getCell = (x, y) => {
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
          return this.grid[this.getIndex(x, y)];
        }
        if (x < 0 || x >= GRID_WIDTH || y < 0) {
          return PARTICLE_TYPES.GLASS;
        }
        return PARTICLE_TYPES.EMPTY;
      };
    }
  }

  resetSettingsForm() {
    document.getElementById('cellSize').value = CELL_SIZE;
    document.getElementById('simSpeed').value = 1;
    document.getElementById('normalGravity').checked = true;
    
    // Add advanced settings reset
    document.getElementById('fluidViscosity').value = this.fluidViscosity;
    document.getElementById('reactionRate').value = this.reactionRate;
    document.getElementById('enableEdgeWrap').checked = this.enableEdgeWrap;
    document.getElementById('enableThermalEffects').checked = this.enableThermalEffects;
    document.getElementById('enablePressure').checked = this.enablePressure;
  }

  handleDraw(e) {
    const rect = this.canvas.getBoundingClientRect();
    const centerX = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const centerY = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // Create filled square pattern
    const halfBrush = Math.floor(this.brushSize / 2);
    
    for (let dy = -halfBrush; dy <= halfBrush; dy++) {
      for (let dx = -halfBrush; dx <= halfBrush; dx++) {
        const targetX = centerX + dx;
        const targetY = centerY + dy;
        
        // Only draw if the target cell isn't glass (to protect the sphere)
        if (this.getCell(targetX, targetY) !== PARTICLE_TYPES.GLASS) {
          // For non-glass materials, add some randomness to make it look more natural
          if (this.selectedType !== PARTICLE_TYPES.GLASS) {
            if (Math.random() < 0.7) {
              this.setCell(targetX, targetY, this.selectedType);
            }
          } else {
            // For glass, always place it (no randomness)
            this.setCell(targetX, targetY, this.selectedType);
          }
        }
      }
    }
  }

  updateCursorPreview(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Size in pixels
    const sizeInPixels = this.brushSize * CELL_SIZE;
    
    this.cursorPreview.style.width = `${sizeInPixels}px`;
    this.cursorPreview.style.height = `${sizeInPixels}px`;
    this.cursorPreview.style.left = `${x - sizeInPixels / 2}px`;
    this.cursorPreview.style.top = `${y - sizeInPixels / 2}px`;
  }

  setActiveButton(buttonId, type) {
    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(buttonId).classList.add('active');
    this.selectedType = type;
  }

  clearGrid() {
    // Clear everything except glass
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (this.getCell(x, y) !== PARTICLE_TYPES.GLASS) {
          this.setCell(x, y, PARTICLE_TYPES.EMPTY);
        }
      }
    }
  }

  drawHollowSphere(centerX, centerY, radius) {
    const thickness = 2;
    const innerRadius = radius - thickness;
    
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius && distance >= innerRadius) {
          this.setCell(Math.floor(x), Math.floor(y), PARTICLE_TYPES.GLASS);
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw glowing glass first
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const index = this.getIndex(x, y);
        const type = this.grid[index];
        if (type === PARTICLE_TYPES.GLASS) {
          const temp = this.glassTemperature.get(index) || 0;
          if (temp > 0) {
            // Draw glow effect
            const radius = CELL_SIZE * 2 * temp;
            const gradient = this.ctx.createRadialGradient(
              x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 0,
              x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, radius
            );
            gradient.addColorStop(0, `rgba(255, 200, 100, ${0.3 * temp})`);
            gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
              x * CELL_SIZE - radius, 
              y * CELL_SIZE - radius, 
              radius * 2 + CELL_SIZE, 
              radius * 2 + CELL_SIZE
            );
          }
        }
      }
    }
    
    // Draw solid particles
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const index = this.getIndex(x, y);
        const type = this.grid[index];
        if (type === PARTICLE_TYPES.SAND || type === PARTICLE_TYPES.GRASS_SEED || type === PARTICLE_TYPES.GRASS) {
          this.ctx.fillStyle = this.colorVariations.get(index);
          this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
    
    // Draw transparent particles
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const index = this.getIndex(x, y);
        const type = this.grid[index];
        if (type === PARTICLE_TYPES.WATER || type === PARTICLE_TYPES.GLASS || 
            type === PARTICLE_TYPES.ALGAE || type === PARTICLE_TYPES.FIRE || 
            type === PARTICLE_TYPES.SMOKE || type === PARTICLE_TYPES.OIL || 
            type === PARTICLE_TYPES.ACID || type === PARTICLE_TYPES.FISH) {
          let color = this.colorVariations.get(index);
          
          // Modify glass color based on temperature
          if (type === PARTICLE_TYPES.GLASS) {
            const temp = this.glassTemperature.get(index) || 0;
            if (temp > 0) {
              const baseColor = this.getColorValues(color);
              const r = Math.min(255, baseColor.r + temp * 200);
              const g = Math.min(255, baseColor.g + temp * 100);
              const b = Math.min(255, baseColor.b + temp * 50);
              color = `rgba(${r}, ${g}, ${b}, ${baseColor.a})`;
            }
          }
          
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  // Helper function to parse color values
  getColorValues(color) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/);
    return match ? {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
      a: match[4] ? parseFloat(match[4]) : 1
    } : { r: 0, g: 0, b: 0, a: 1 };
  }

  savePreset(name) {
    // Create a snapshot of the current state
    const preset = {
      grid: [...this.grid],
      colorVariations: Array.from(this.colorVariations.entries()),
      growthStages: Array.from(this.growthStages.entries()),
      glassTemperature: Array.from(this.glassTemperature.entries())
    };

    this.presets.set(name, preset);
    this.savePresetsToStorage();
    this.updatePresetList();
  }

  loadPreset(name) {
    const preset = this.presets.get(name);
    if (preset) {
      this.grid = [...preset.grid];
      this.colorVariations = new Map(preset.colorVariations);
      this.growthStages = new Map(preset.growthStages);
      this.glassTemperature = new Map(preset.glassTemperature);
    }
  }

  deletePreset(name) {
    this.presets.delete(name);
    this.savePresetsToStorage();
    this.updatePresetList();
  }

  savePresetsToStorage() {
    const data = Array.from(this.presets.entries());
    localStorage.setItem('sandSimulatorPresets', JSON.stringify(data));
  }

  loadPresetsFromStorage() {
    try {
      const data = localStorage.getItem('sandSimulatorPresets');
      if (data) {
        this.presets = new Map(JSON.parse(data));
        this.updatePresetList();
      }
    } catch (error) {
      console.error('Error loading presets:', error);
      this.presets = new Map();
    }
  }

  updatePresetList() {
    const select = document.getElementById('presetList');
    select.innerHTML = '';
    
    for (const name of this.presets.keys()) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    }
  }

}

new SandSimulator();