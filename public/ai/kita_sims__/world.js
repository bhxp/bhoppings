import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VoxelWorld } from './voxelWorld.js';
import { gameDatabase } from './database.js';
import { coordinateSystem } from './coordinateSystem.js';

export class World {
  constructor(game) {
    this.game = game;
    this.objects = new Map();
    this.npcs = new Set();
    this.equipment = new Set();
    this.rooms = new Set();

    this.initScene();
    this.initVoxelWorld();
    this.setupControls();
    this.setupLighting();

    this.raycaster = new THREE.Raycaster();

    window.addEventListener('resize', () => this.onWindowResize());

    this.interactionPoints = new Map();
    this.currentHighlight = null;

    // Create highlight material for interaction points
    this.highlightGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5
    });

    // Bind the interaction point creation method
    this.createInteractionPoint = this.createInteractionPoint.bind(this);

    // Initialize additional systems (if not yet implemented, these are placeholders)
    this.initializeNPCs();
    this.initializeEquipment();
    this.initializeInteractionPoints();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Get the canvas from index.html
    const canvas = document.getElementById('game-world');
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Set an initial camera position and target
    this.camera.position.set(20, 15, 20);
    this.camera.lookAt(0, 5, 0);
  }

  initVoxelWorld() {
    this.voxelWorld = new VoxelWorld(this);
    this.scene.add(this.voxelWorld.group);
    this.createInitialStructure();
    // After building the voxel structure, add layer number labels.
    this.voxelWorld.updateLayerLabels();
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.keys = {};
    document.addEventListener('keydown', (e) => (this.keys[e.code] = true));
    document.addEventListener('keyup', (e) => (this.keys[e.code] = false));
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    this.scene.add(directionalLight);
  }

  createInitialStructure() {
    // Create ground layer using voxels
    for (let x = -20; x < 20; x++) {
      for (let z = -20; z < 20; z++) {
        this.voxelWorld.setVoxel(x, 0, z, 1); // Ground layer
      }
    }

    // Create rooms for main daycare building at y=6 (elevated)
    this.createRoom(-8, 6, -8, 16, 4, 16, 'playroom'); 
    this.createRoom(-18, 6, -8, 8, 4, 12, 'kitchen'); 
    this.createRoom(10, 6, -8, 8, 4, 12, 'restroom');  
    this.createRoom(-8, 6, 10, 16, 4, 8, 'activityroom');  
    this.addFunctionalObjects();
  }

  createRoom(x, y, z, width, height, depth, type) {
    // Floor of room
    for (let i = x; i < x + width; i++) {
      for (let j = z; j < z + depth; j++) {
        this.voxelWorld.setVoxel(i, y, j, 2);
      }
    }
    
    // Walls along one side
    for (let i = x; i < x + width; i++) {
      for (let h = y + 1; h < y + height; h++) {
        if (h === y + 2 && (i - x) % 4 === 0) {
          this.voxelWorld.setVoxel(i, h, z, 5);
        } else {
          this.voxelWorld.setVoxel(i, h, z, 3);
        }
        if (h === y + 2 && (i - x) % 4 === 2) {
          this.voxelWorld.setVoxel(i, h, z + depth - 1, 5);
        } else {
          this.voxelWorld.setVoxel(i, h, z + depth - 1, 3);
        }
      }
    }
    
    // Walls along the other side
    for (let j = z; j < z + depth; j++) {
      for (let h = y + 1; h < y + height; h++) {
        if (h === y + 2 && (j - z) % 4 === 0) {
          this.voxelWorld.setVoxel(x, h, j, 5);
        } else {
          this.voxelWorld.setVoxel(x, h, j, 3);
        }
        if (h === y + 2 && (j - z) % 4 === 2) {
          this.voxelWorld.setVoxel(x + width - 1, h, j, 5);
        } else {
          this.voxelWorld.setVoxel(x + width - 1, h, j, 3);
        }
      }
    }

    this.rooms.add({ type, bounds: { x, y, z, width, height, depth } });
    const roomId = `${type}-${x}-${z}-${Date.now()}`;
    gameDatabase.registerRoom(roomId, {
      type,
      bounds: { x, y, z, width, height, depth },
      floorHeight: y
    });
  }

  addFunctionalObjects() {
    this.rooms.forEach(room => {
      const { x, y, z, width, depth } = room.bounds;
      const centerX = x + width / 2;
      const centerZ = z + depth / 2;
      switch (room.type) {
        case 'kitchen':
          this.addFunctionalObject('fridge', centerX - 2, y, centerZ - 2);
          this.addFunctionalObject('stove', centerX, y, centerZ - 2);
          this.addFunctionalObject('sink', centerX + 2, y, centerZ - 2);
          this.addFunctionalObject('table', centerX, y, centerZ + 2);
          this.addFunctionalObject('chair', centerX - 1, y, centerZ + 2);
          this.addFunctionalObject('chair', centerX + 1, y, centerZ + 2);
          break;
        case 'playroom':
          this.addFunctionalObject('toybox', centerX - 3, y, centerZ - 3);
          this.addFunctionalObject('playground', centerX, y, centerZ);
          this.addFunctionalObject('bookshelf', centerX + 3, y, centerZ - 3);
          this.addFunctionalObject('artTable', centerX - 2, y, centerZ + 3);
          break;
        case 'restroom':
          this.addFunctionalObject('bed', centerX - 2, y, centerZ - 2);
          this.addFunctionalObject('bed', centerX + 2, y, centerZ - 2);
          this.addFunctionalObject('bed', centerX - 2, y, centerZ + 2);
          this.addFunctionalObject('bed', centerX + 2, y, centerZ + 2);
          break;
        case 'activityroom':
          this.addFunctionalObject('desk', centerX - 3, y, centerZ);
          this.addFunctionalObject('chair', centerX - 3, y, centerZ + 1);
          this.addFunctionalObject('computer', centerX - 3, y, centerZ);
          this.addFunctionalObject('musicBox', centerX + 3, y, centerZ);
          break;
      }
    });
  }

  addFunctionalObject(type, x, y, z) {
    const object = this.createFunctionalObject(type, x, y, z);
    if (object) {
      this.scene.add(object.mesh);
      this.objects.set(`${type}-${x}-${y}-${z}`, object);
      for (const room of this.rooms) {
        const { bounds } = room;
        if (
          x >= bounds.x &&
          x < bounds.x + bounds.width &&
          z >= bounds.z &&
          z < bounds.z + bounds.depth
        ) {
          room.functionalObjects = room.functionalObjects || new Set();
          room.functionalObjects.add(object);
          break;
        }
      }
    }
  }

  createFunctionalObject(type, x, y, z) {
    const objectConfigs = {
      fridge: {
        geometry: new THREE.BoxGeometry(3, 6, 3),
        color: 0xCCCCCC,
        interaction: {
          type: 'eat',
          needsAffected: { hunger: 30 },
          duration: 60
        }
      },
      stove: {
        geometry: new THREE.BoxGeometry(3, 3, 3),
        color: 0x555555,
        interaction: {
          type: 'cook',
          needsAffected: { hunger: 40 },
          duration: 120
        }
      },
      sink: {
        geometry: new THREE.BoxGeometry(2.4, 3, 2.4),
        color: 0xAAAAAA,
        interaction: {
          type: 'clean',
          needsAffected: { hygiene: 25 },
          duration: 30
        }
      },
      table: {
        geometry: new THREE.BoxGeometry(4, 2.4, 4),
        color: 0x8B4513,
        interaction: {
          type: 'eat',
          needsAffected: { hunger: 20 },
          duration: 45
        }
      },
      chair: {
        geometry: new THREE.BoxGeometry(1.6, 2.4, 1.6),
        color: 0x8B4513,
        interaction: {
          type: 'sit',
          needsAffected: { energy: 10 },
          duration: 30
        }
      },
      toybox: {
        geometry: new THREE.BoxGeometry(3, 2, 3),
        color: 0xFF69B4,
        interaction: {
          type: 'play',
          needsAffected: { fun: 30 },
          duration: 90
        }
      },
      playground: {
        geometry: new THREE.CylinderGeometry(4, 4, 6, 8),
        color: 0x4CAF50,
        interaction: {
          type: 'play',
          needsAffected: { fun: 40, energy: -10 },
          duration: 120
        }
      },
      bed: {
        geometry: new THREE.BoxGeometry(4, 1.6, 6),
        color: 0x4169E1,
        interaction: {
          type: 'sleep',
          needsAffected: { energy: 50 },
          duration: 180
        }
      },
      computer: {
        geometry: new THREE.BoxGeometry(2, 2, 2),
        color: 0x000000,
        interaction: {
          type: 'work',
          needsAffected: { fun: 20, energy: -10 },
          duration: 90
        }
      },
      bookshelf: {
        geometry: new THREE.BoxGeometry(3, 6, 0.5),
        color: 0x8B4513,
        interaction: {
          type: 'read',
          needsAffected: { fun: 15 },
          duration: 60
        }
      },
      artTable: {
        geometry: new THREE.BoxGeometry(3, 1.5, 3),
        color: 0xFFD700,
        interaction: {
          type: 'create',
          needsAffected: { fun: 20 },
          duration: 90
        }
      },
      desk: {
        geometry: new THREE.BoxGeometry(3, 1.8, 2),
        color: 0x333333,
        interaction: {
          type: 'work',
          needsAffected: { fun: 10, energy: -5 },
          duration: 90
        }
      },
      musicBox: {
        geometry: new THREE.BoxGeometry(2, 2, 2),
        color: 0xFFA500,
        interaction: {
          type: 'play',
          needsAffected: { fun: 25 },
          duration: 60
        }
      }
    };

    const config = objectConfigs[type];
    if (!config) return null;
    const material = new THREE.MeshLambertMaterial({ 
      color: config.color,
      transparent: true,
      opacity: 0.7
    });
    const mesh = new THREE.Mesh(config.geometry, material);
    // Adjust the object's position so its bottom sits on the floor
    mesh.position.set(
      x,
      y + (config.geometry.parameters.height ? config.geometry.parameters.height / 2 : 0),
      z
    );
    // Scale the object by 2
    mesh.scale.set(2, 2, 2);

    const id = `${type}-${x}-${z}-${Date.now()}`;
    gameDatabase.registerObject(id, {
      type,
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      interaction: config.interaction
    });
    coordinateSystem.register('object', id, {
      x: mesh.position.x,
      y: mesh.position.y,
      z: mesh.position.z
    });

    return {
      type,
      mesh,
      interaction: config.interaction,
      isOccupied: false,
      currentUser: null
    };
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initializeNPCs() {
    // ...existing NPC initialization code...
  }

  initializeEquipment() {
    // ...existing equipment initialization code...
  }

  initializeInteractionPoints() {
    // ...existing interaction point initialization code...
  }

  getNearestExit(position) {
    // Dummy implementation; replace with logic to determine the nearest exit.
    return new THREE.Vector3(0, position.y, 0);
  }

  createInteractionPoint(x, y, z, type, icon, tooltip, callback) {
    // Create a canvas for the sprite
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    // Draw a circle as background
    context.beginPath();
    context.arc(64, 64, 50, 0, Math.PI * 2);
    context.fillStyle = 'rgba(255, 215, 0, 0.8)'; // gold color
    context.fill();
    // Draw the provided icon in the center
    context.font = 'bold 48px sans-serif';
    context.fillStyle = 'black';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(icon, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y, z);
    sprite.scale.set(3, 3, 1);
    this.scene.add(sprite);

    const key = `${x},${y},${z}`;
    this.interactionPoints.set(key, { sprite, callback });

    // Optionally, you can add pointer event listeners here to trigger the callback.
    return sprite;
  }

  removeInteractionPoint(position) {
    const key = `${position.x},${position.y},${position.z}`;
    const record = this.interactionPoints.get(key);
    if (record) {
      this.scene.remove(record.sprite);
      this.interactionPoints.delete(key);
    }
  }

  highlightInteractionPoint(position) {
    if (this.currentHighlight) {
      this.scene.remove(this.currentHighlight);
    }
    const highlightMesh = new THREE.Mesh(this.highlightGeometry, this.highlightMaterial);
    highlightMesh.position.set(position.x, position.y, position.z);
    this.scene.add(highlightMesh);
    this.currentHighlight = highlightMesh;
  }

  update() {
    // Update the controls (for damping) and render the scene every frame.
    if (this.controls) this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}