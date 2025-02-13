import * as THREE from 'three';
import { gameDatabase } from './database.js';
import { coordinateSystem } from './coordinateSystem.js';

export class ObjectManager {
  constructor(world) {
    this.world = world;
    this.objectRegistry = new Map(); // Tracks all placeable objects
    this.requiredObjects = [ // List of required safety objects
      {
        type: 'fireExtinguisher',
        name: 'Fire Extinguisher',
        required: 4,
        placed: 0,
        positions: []
      },
      {
        type: 'emergencyPhone',
        name: 'Emergency Phone',
        required: 2,
        placed: 0,
        positions: []
      },
      {
        type: 'smokeDetector',
        name: 'Smoke Detector',
        required: 8,
        placed: 0,
        positions: []
      },
      {
        type: 'firstAidKit',
        name: 'First Aid Kit',
        required: 3,
        placed: 0,
        positions: []
      },
      {
        type: 'evacuationPlan',
        name: 'Evacuation Plan',
        required: 4,
        placed: 0,
        positions: []
      }
    ];
  }

  // Check if all required objects are placed correctly
  checkRequiredObjects() {
    const status = this.requiredObjects.map(obj => ({
      ...obj,
      complete: obj.placed >= obj.required
    }));
    return status;
  }

  // Add new object to the world
  placeObject(type, position) {
    const obj = this.createObject(type, position);
    if (obj) {
      const key = `${type}-${position.x}-${position.y}-${position.z}`;
      this.objectRegistry.set(key, obj);
      this.updateRequiredCount(type);
      // Register in persistent database
      gameDatabase.registerObject(key, {
        type,
        position: { x: position.x, y: position.y, z: position.z }
      });
    }
    return obj;
  }

  // Create object mesh based on type
  createObject(type, position) {
    const objDef = this.requiredObjects.find(o => o.type === type);
    if (!objDef) return null;

    // Create mesh based on type with transparency
    const geometry = this.getGeometryForType(type);
    const material = this.getMaterialForType(type);
    material.transparent = true;
    material.opacity = 0.6;
    const mesh = new THREE.Mesh(geometry, material);
    // Adjust position so that the object sits on the floor
    // (its bottom is placed at the floor: add half the object’s height if available)
    mesh.position.set(
      position.x, 
      position.y + (geometry.parameters.height ? geometry.parameters.height / 2 : 0),
      position.z
    );
    // Scale the object by 4 (increased from 2)
    mesh.scale.set(4, 4, 4);
    
    // Register the object in the coordinate index
    const key = `${type}-${position.x}-${position.y}-${position.z}`;
    coordinateSystem.register('object', key, { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
    
    return mesh;
  }

  // Update count of placed objects
  updateRequiredCount(type) {
    const obj = this.requiredObjects.find(o => o.type === type);
    if (obj) {
      obj.placed++;
    }
  }

  getGeometryForType(type) {
    let geometry;
    switch(type) {
      case 'fireExtinguisher':
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 2, 8);
        break;
      case 'emergencyPhone':
        geometry = new THREE.BoxGeometry(0.6, 1, 0.4);
        break;
      case 'smokeDetector':
        geometry = new THREE.SphereGeometry(0.4, 16, 16);
        break;
      case 'firstAidKit':
        geometry = new THREE.BoxGeometry(0.8, 0.4, 0.8);
        break;
      case 'evacuationPlan':
        geometry = new THREE.PlaneGeometry(1.2, 0.8);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
    }
    return geometry;
  }

  getMaterialForType(type) {
    let material;
    switch(type) {
      case 'fireExtinguisher':
        material = new THREE.MeshLambertMaterial({ 
          color: 0xff0000,
          transparent: true,
          opacity: 0.6
        });
        break;
      case 'emergencyPhone':
        material = new THREE.MeshLambertMaterial({ 
          color: 0x00ff00,
          transparent: true,
          opacity: 0.6
        });
        break;
      case 'smokeDetector':
        material = new THREE.MeshLambertMaterial({ 
          color: 0xffff00,
          transparent: true,
          opacity: 0.6
        });
        break;
      case 'firstAidKit':
        material = new THREE.MeshLambertMaterial({ 
          color: 0xffffff,
          transparent: true,
          opacity: 0.6
        });
        break;
      case 'evacuationPlan':
        material = new THREE.MeshLambertMaterial({ 
          color: 0x0000ff,
          transparent: true,
          opacity: 0.6
        });
        break;
      default:
        material = new THREE.MeshLambertMaterial({ 
          color: 0xcccccc,
          transparent: true,
          opacity: 0.6
        });
        break;
    }
    return material;
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
    // Position so that the bottom sits on the floor:
    mesh.position.set(
      x, 
      y + (config.geometry.parameters.height ? config.geometry.parameters.height / 2 : 0),
      z
    );
    // Scale up by 4 (increased from 2)
    mesh.scale.set(4, 4, 4);
    
    // Register the created object in the persistent database
    const id = `${type}-${x}-${z}-${Date.now()}`;
    gameDatabase.registerObject(id, {
      type,
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      interaction: config.interaction
    });
    // Also register in the coordinate system index
    coordinateSystem.register('object', id, { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z });
    
    return {
      type,
      mesh,
      interaction: config.interaction,
      isOccupied: false,
      currentUser: null
    };
  }
}