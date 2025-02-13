import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { Car } from './car.js';
import { Terrain } from './terrain.js';
import { NetworkManager } from './network.js';

export class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
    this.renderer = new THREE.WebGLRenderer();
    
    this.cameraAngle = Math.PI;
    this.cameraHeight = Math.PI / 4;
    this.cameraRotationSpeed = 2.0;
    this.cameraHeightSpeed = 1.0;
    this.isRotatingCamera = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.minHeight = Math.PI / 16;
    this.maxHeight = Math.PI / 2.5;
    
    this.prevTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = 0;

    this.cars = new Map(); // Store all cars including other players
    this.localCar = null;
    this.carControls = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false
    };

    this.terrain = null;
    this.networkManager = null;
    
    this.loadingProgress = 0;
    this.loadingTasks = 0;
    this.completedTasks = 0;
    this.loadingTips = [
      "Tip: Hold right click and move the mouse to rotate the camera",
      "Tip: Use arrow keys to control your car",
      "Tip: Move the mouse up and down while holding right click to adjust camera height",
      "Tip: The road extends infinitely - explore as far as you want!",
      "Tip: Watch out for other players on the road",
      "Tip: Generating terrain and scenery...",
      "Tip: Loading 3D models and textures..."
    ];
    
    this.aiCars = []; 
    this.aiCarCount = 5; 
    this.aiUpdateInterval = null;
    this.collisionCooldown = new Map();
    
    this.baseCameraDistance = 10;
    this.cameraDistance = this.baseCameraDistance;
    this.minCameraDistance = 5;
    this.maxCameraDistance = 20;
    this.zoomSpeed = 0.5;
    
    this.init();
  }

  updateLoadingProgress(taskWeight = 1) {
    this.completedTasks += taskWeight;
    this.loadingProgress = (this.completedTasks / this.loadingTasks) * 100;
    
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
      progressBar.style.width = `${this.loadingProgress}%`;
    }
    
    // Update loading tip more frequently during longer load
    if (Math.random() < 0.2) { // 20% chance to change tip each update
      const tipElement = document.getElementById('loading-tip');
      if (tipElement) {
        const randomTip = this.loadingTips[Math.floor(Math.random() * this.loadingTips.length)];
        tipElement.textContent = randomTip;
      }
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }

  async init() {
    try {
      // Set total loading tasks (adjusted weights)
      this.loadingTasks = 100; // Total weight of all tasks
      
      // Setup renderer (weight: 5)
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.body.appendChild(this.renderer.domElement);
      this.updateLoadingProgress(5);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Setup enhanced lighting (weight: 10)
      // Ambient light for general illumination
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      this.scene.add(ambientLight);

      // Main directional light (sun)
      const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
      sunLight.position.set(100, 100, 50);
      sunLight.castShadow = true;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -100;
      sunLight.shadow.camera.right = 100;
      sunLight.shadow.camera.top = 100;
      sunLight.shadow.camera.bottom = -100;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.bias = -0.0001;
      this.scene.add(sunLight);

      // Fill light for softer shadows
      const fillLight = new THREE.DirectionalLight(0x8088ff, 0.3);
      fillLight.position.set(-50, 50, -50);
      this.scene.add(fillLight);

      // Ground fill light
      const groundFill = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
      this.scene.add(groundFill);

      this.updateLoadingProgress(10);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Initialize terrain (weight: 40)
      try {
        this.terrain = new Terrain(this.scene);
        if (!this.terrain) {
          throw new Error('Failed to create terrain');
        }
        // Add artificial delay to allow for chunk generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        this.updateLoadingProgress(40);
      } catch (error) {
        console.error('Error initializing terrain:', error);
        throw error;
      }

      // Initialize networking (weight: 15)
      this.networkManager = new NetworkManager();
      await this.networkManager.init();
      this.updateLoadingProgress(15);

      await new Promise(resolve => setTimeout(resolve, 500));

      // Create local car with actual username
      window.websim.getUser().then(user => {
        this.localCar = new Car(this.scene, this.networkManager.getClientId(), user.username);
        this.cars.set(this.networkManager.getClientId(), this.localCar);
        
        // Setup network handlers and event listeners (weight: 15)
        this.setupNetworkHandlers();
        this.setupEventListeners();
        this.updateLoadingProgress(15);

        // Add AI cars after local player is initialized (weight: 10)
        this.generateAICars();
        this.updateLoadingProgress(10);

        // Start AI car movement loop
        this.startAICarLoop();

        // Ensure everything is fully loaded
        this.updateLoadingProgress(30);

        // Hide loading screen and start animation
        this.hideLoadingScreen();
        this.animate();
      });
    } catch (error) {
      console.error('Error during game initialization:', error);
      // Show error message to user
      const loadingTip = document.getElementById('loading-tip');
      if (loadingTip) {
        loadingTip.textContent = 'Error loading game. Please refresh the page.';
        loadingTip.style.color = 'red';
      }
    }
  }

  setupNetworkHandlers() {
    this.networkManager.onPlayerJoin((id, position) => {
      if (id !== this.networkManager.getClientId()) {
        const car = new Car(this.scene, id);
        car.mesh.position.copy(position);
        this.cars.set(id, car);
      }
    });

    this.networkManager.onPlayerLeave((id) => {
      const car = this.cars.get(id);
      if (car) {
        car.remove();
        this.cars.delete(id);
      }
    });

    this.networkManager.onCarUpdate((id, position, rotation, speed) => {
      if (id !== this.networkManager.getClientId()) {
        const car = this.cars.get(id);
        if (car) {
          car.updateFromNetwork(position, rotation, speed);
        }
      }
    });
  }

  setupEventListeners() {
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
    document.addEventListener('mousedown', (event) => this.onMouseDown(event));
    document.addEventListener('mouseup', (event) => this.onMouseUp(event));
    document.addEventListener('keydown', (event) => this.onCarKeyDown(event));
    document.addEventListener('keyup', (event) => this.onCarKeyUp(event));
    window.addEventListener('resize', () => this.onWindowResize());
    document.addEventListener('wheel', (event) => this.onMouseWheel(event));
  }

  onMouseMove(event) {
    if (this.isRotatingCamera) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      // Update horizontal rotation (inverted the sign here)
      this.cameraAngle -= (movementX * 0.01) * this.cameraRotationSpeed;
      
      // Update vertical rotation with limits
      this.cameraHeight += (movementY * 0.01) * this.cameraHeightSpeed;
      this.cameraHeight = Math.max(this.minHeight, Math.min(this.maxHeight, this.cameraHeight));
    }
  }

  onMouseDown(event) {
    if (event.button === 2) { // Right mouse button
      this.isRotatingCamera = true;
    }
  }

  onMouseUp(event) {
    if (event.button === 2) { // Right mouse button
      this.isRotatingCamera = false;
    }
  }

  onMouseWheel(event) {
    // Determine zoom direction (-1 for zoom in, 1 for zoom out)
    const zoomDirection = Math.sign(event.deltaY);
    
    // Update camera distance with smooth damping
    this.cameraDistance += zoomDirection * this.zoomSpeed;
    
    // Clamp camera distance between min and max values
    this.cameraDistance = Math.max(
      this.minCameraDistance,
      Math.min(this.maxCameraDistance, this.cameraDistance)
    );
  }

  onCarKeyDown(event) {
    switch(event.code) {
      case 'ArrowUp':
        this.carControls.accelerate = true;
        break;
      case 'ArrowDown':
        this.carControls.brake = true;
        break;
      case 'ArrowLeft':
        this.carControls.turnLeft = true;
        break;
      case 'ArrowRight':
        this.carControls.turnRight = true;
        break;
    }
  }

  onCarKeyUp(event) {
    switch(event.code) {
      case 'ArrowUp':
        this.carControls.accelerate = false;
        break;
      case 'ArrowDown':
        this.carControls.brake = false;
        break;
      case 'ArrowLeft':
        this.carControls.turnLeft = false;
        break;
      case 'ArrowRight':
        this.carControls.turnRight = false;
        break;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  checkCollisions() {
    const now = performance.now();
    
    // Check collisions between all player cars only
    const allCars = [...this.cars.values()];
    
    for (let i = 0; i < allCars.length; i++) {
      for (let j = i + 1; j < allCars.length; j++) {
        const carA = allCars[i];
        const carB = allCars[j];
        
        // Skip if either car is in collision cooldown
        const cooldownKey = `${carA.id}-${carB.id}`;
        if (this.collisionCooldown.has(cooldownKey)) {
          if (now - this.collisionCooldown.get(cooldownKey) < 1000) {
            continue;
          }
          this.collisionCooldown.delete(cooldownKey);
        }
        
        if (carA.checkCollision(carB)) {
          // Handle collision
          carA.handleCollision();
          carB.handleCollision();
          
          // Add collision cooldown
          this.collisionCooldown.set(cooldownKey, now);
          
          // Create collision effect
          this.createCollisionEffect(carA.mesh.position);
        }
      }
    }
  }

  createCollisionEffect(position) {
    // Create a simple particle effect at collision point
    const particles = new THREE.Group();
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    
    for (let i = 0; i < 8; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(position);
      particles.add(particle);
      
      // Animate particles using simple velocity
      const angle = (i / 8) * Math.PI * 2;
      const speed = 5;
      const velocity = {
        x: Math.cos(angle) * speed,
        y: speed,
        z: Math.sin(angle) * speed
      };
      
      // Store initial time
      particle.userData.startTime = performance.now();
      particle.userData.velocity = velocity;
      
      // Add to scene
      this.scene.add(particles);
      
      // Set up animation
      const animateParticle = () => {
        const elapsed = (performance.now() - particle.userData.startTime) / 1000;
        if (elapsed > 0.5) {
          // Remove particle after 0.5 seconds
          this.scene.remove(particles);
          return;
        }
        
        // Update position using velocity and gravity
        particle.position.x += particle.userData.velocity.x * 0.016;
        particle.position.y += particle.userData.velocity.y * 0.016;
        particle.position.z += particle.userData.velocity.z * 0.016;
        
        // Apply gravity
        particle.userData.velocity.y -= 20 * 0.016;
        
        requestAnimationFrame(animateParticle);
      };
      
      animateParticle();
    }
  }

  generateAICars() {
    const roadWidth = 10; // width of the road from terrain.js
    const mapSize = 1000; // Larger map area for AI cars to explore

    const usernames = new Set(); // Ensure unique usernames

    for (let i = 0; i < this.aiCarCount; i++) {
      // Generate position anywhere in the map
      const x = (Math.random() - 0.5) * mapSize;
      const z = (Math.random() - 0.5) * mapSize;

      const car = new Car(this.scene, `ai_car_${i}`);
      const username = car.username;

      // Ensure unique usernames
      while (usernames.has(username)) {
        car.username = car.generatePlayerUsername();
      }
      usernames.add(car.username);

      // Position car on the map
      car.mesh.position.set(x, 0, z);
      
      // Set AI car's max speed to match player's max speed
      car.maxSpeed = this.localCar ? this.localCar.maxSpeed : 27.78;
      car.maxReverseSpeed = this.localCar ? this.localCar.maxReverseSpeed : 11.11;

      // Add route planning for each AI car
      car.currentRoute = this.generateRoute(x, z);
      car.routeProgress = 0;

      // Store AI car
      this.aiCars.push(car);
      this.cars.set(car.id, car);
    }
  }

  generateRoute(startX, startZ) {
    const routeLength = 5; // Number of waypoints
    const route = [{ x: startX, z: startZ }];

    for (let i = 1; i < routeLength; i++) {
      const lastPoint = route[i - 1];
      
      // Generate next point with more linear and controlled randomness
      const directionVariance = 50; // Maximum distance between waypoints
      const nextX = lastPoint.x + (Math.random() - 0.5) * directionVariance;
      const nextZ = lastPoint.z + (Math.random() - 0.5) * directionVariance;

      route.push({ x: nextX, z: nextZ });
    }

    return route;
  }

  updateAICars() {
    this.aiCars.forEach(aiCar => {
      // If no route or route completed, generate a new route
      if (!aiCar.currentRoute || aiCar.routeProgress >= aiCar.currentRoute.length - 1) {
        aiCar.currentRoute = this.generateRoute(aiCar.mesh.position.x, aiCar.mesh.position.z);
        aiCar.routeProgress = 0;
      }

      // Get current and next waypoint
      const currentWaypoint = aiCar.currentRoute[aiCar.routeProgress];
      const nextWaypoint = aiCar.currentRoute[aiCar.routeProgress + 1];

      // Calculate direction to next waypoint
      const dx = nextWaypoint.x - aiCar.mesh.position.x;
      const dz = nextWaypoint.z - aiCar.mesh.position.z;
      const distanceToWaypoint = Math.sqrt(dx * dx + dz * dz);

      // Determine AI car controls based on waypoint direction
      const aiControls = {
        accelerate: true, // Always try to move towards waypoint
        brake: false,
        turnLeft: dx < 0,
        turnRight: dx > 0
      };

      // Update car based on route
      aiCar.update(0.1, aiControls);

      // Check if waypoint is reached
      if (distanceToWaypoint < 5) {
        aiCar.routeProgress++;
      }
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = performance.now();
    const delta = Math.min((time - this.prevTime) / 1000, 0.1);
    this.prevTime = time;

    // Update local car and check collisions
    if (this.localCar) {
      this.localCar.update(delta, this.carControls);
      this.networkManager.sendCarUpdate(
        this.localCar.mesh.position,
        this.localCar.mesh.rotation,
        this.localCar.acceleration
      );

      this.lastPosition = this.localCar.mesh.position.clone();

      // Check for collisions between player cars only
      this.checkCollisions();

      // Update camera
      const verticalDistance = this.cameraDistance * Math.sin(this.cameraHeight);
      const horizontalDistance = this.cameraDistance * Math.cos(this.cameraHeight);
      
      const cameraX = this.localCar.mesh.position.x + Math.sin(this.cameraAngle) * horizontalDistance;
      const cameraY = (this.cameraDistance * 0.5) + verticalDistance; // Adjusted base height to scale with zoom
      const cameraZ = this.localCar.mesh.position.z + Math.cos(this.cameraAngle) * horizontalDistance;
      
      this.camera.position.set(cameraX, cameraY, cameraZ);
      this.camera.lookAt(
        this.localCar.mesh.position.x,
        this.localCar.mesh.position.y + 2,
        this.localCar.mesh.position.z
      );

      // Update terrain around local car
      this.terrain.update(this.localCar.mesh.position);

      // Update speedometer
      const speedKMH = Math.round(Math.abs(this.localCar.acceleration) * 3.6);
      document.getElementById('speed').textContent = speedKMH;
    }

    this.updateFPS();
    this.renderer.render(this.scene, this.camera);
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      document.getElementById('fps').textContent = fps;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  startAICarLoop() {
    this.aiUpdateInterval = setInterval(() => {
      this.updateAICars();
    }, 100); // Update every 100ms
  }

  cleanupAICars() {
    if (this.aiUpdateInterval) {
      clearInterval(this.aiUpdateInterval);
    }

    this.aiCars.forEach(aiCar => {
      this.scene.remove(aiCar.mesh);
    });
    
    this.aiCars = [];
  }

  saveTotalKilometers() {
    // Implementation for saving kilometers
  }

  loadTotalKilometers() {
    // Implementation for loading kilometers
  }
}

// Start the game
new Game();