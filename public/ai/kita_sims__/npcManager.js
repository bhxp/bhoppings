import * as THREE from 'three';
import { gameDatabase } from './database.js';
import { coordinateSystem } from './coordinateSystem.js';

export class NPCManager {
  constructor(world) {
    this.world = world;
    this.npcs = new Map();
    
    // Updated NPC types with proper positioning and movement
    this.npcTypes = {
      teacher: {
        height: 3.0,
        width: 1.5,
        depth: 1.0,
        color: 0x4a90e2,
        speed: 1.2,
        yOffset: 6.0, // Position at floor level (6 units up)
        walkRadius: 8.0
      },
      child: {
        height: 2.0,
        width: 1.0,
        depth: 0.8,
        color: 0xf5a623,
        speed: 0.8,
        yOffset: 6.0,
        walkRadius: 5.0
      }
    };

    // Store movement targets for each NPC
    this.movementTargets = new Map();

    // Define more interaction zones across the map
    this.interactionZones = [
      { type: 'play', position: new THREE.Vector3(-15, 6, -15), radius: 5 },
      { type: 'play', position: new THREE.Vector3(15, 6, 15), radius: 5 },
      { type: 'learn', position: new THREE.Vector3(0, 6, 0), radius: 6 },
      { type: 'learn', position: new THREE.Vector3(-10, 6, 10), radius: 4 },
      { type: 'rest', position: new THREE.Vector3(10, 6, -10), radius: 4 },
      { type: 'rest', position: new THREE.Vector3(-8, 6, 0), radius: 3 }
    ];

    // Start small fire simulation
    this.initializeFireEffect();
  }

  createNPC(type, position, name, age) {
    const npcConfig = this.npcTypes[type];
    if (!npcConfig) return null;

    const npcGroup = new THREE.Group();
    const heightPosition = position.y + npcConfig.yOffset;

    // Create body
    const bodyGeometry = new THREE.BoxGeometry(
      npcConfig.width,
      npcConfig.height * 0.6,
      npcConfig.depth
    );
    const bodyMaterial = new THREE.MeshLambertMaterial({ 
      color: npcConfig.color,
      flatShading: true,
      transparent: true,
      opacity: 0.7
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Create head
    const headSize = type === 'child' ? 0.8 : 0.7;
    const headGeometry = new THREE.SphereGeometry(headSize, 12, 12);
    const headMaterial = new THREE.MeshLambertMaterial({ 
      color: npcConfig.color,
      flatShading: true,
      transparent: true,
      opacity: 0.7
    });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.y = (npcConfig.height * 0.6) / 2 + headSize * 0.8;

    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const eyeMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const pupilGeometry = new THREE.SphereGeometry(0.07, 8, 8);
    const pupilMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x000000,
      transparent: true,
      opacity: 0.9
    });
    const leftEyeWhite = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const leftEyePupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftEyeWhite.position.set(-0.25, 0.1, headSize * 0.8);
    leftEyePupil.position.set(-0.25, 0.1, headSize * 0.9);
    const rightEyeWhite = new THREE.Mesh(eyeGeometry, eyeMaterial);
    const rightEyePupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightEyeWhite.position.set(0.25, 0.1, headSize * 0.8);
    rightEyePupil.position.set(0.25, 0.1, headSize * 0.9);
    headMesh.add(leftEyeWhite, leftEyePupil, rightEyeWhite, rightEyePupil);

    // Create limbs
    const limbGeometry = new THREE.BoxGeometry(0.3, npcConfig.height * 0.4, 0.3);
    const limbMaterial = new THREE.MeshLambertMaterial({ 
      color: npcConfig.color,
      transparent: true,
      opacity: 0.7
    });
    const leftArm = new THREE.Mesh(limbGeometry, limbMaterial);
    leftArm.position.set(-npcConfig.width / 2 - 0.2, 0, 0);
    const rightArm = new THREE.Mesh(limbGeometry, limbMaterial);
    rightArm.position.set(npcConfig.width / 2 + 0.2, 0, 0);
    const leftLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    leftLeg.position.set(-npcConfig.width / 4, -npcConfig.height * 0.3, 0);
    const rightLeg = new THREE.Mesh(limbGeometry, limbMaterial);
    rightLeg.position.set(npcConfig.width / 4, -npcConfig.height * 0.3, 0);

    npcGroup.add(bodyMesh, headMesh, leftArm, rightArm, leftLeg, rightLeg);
    npcGroup.position.set(
      position.x,
      heightPosition,
      position.z
    );

    const npc = {
      mesh: npcGroup,
      type,
      name,
      age,
      position: new THREE.Vector3(position.x, heightPosition, position.z),
      state: 'normal',
      needs: {
        hunger: 100,
        energy: 100,
        social: 100,
        fun: 100,
        hygiene: 100
      },
      traits: this.getRandomTraits(),
      currentAction: null,
      actionQueue: [],
      relationships: new Map(),
      mood: 'happy'
    };

    this.npcs.set(name, npc);
    this.world.scene.add(npcGroup);

    // Register the NPC in persistent database
    gameDatabase.registerNPC(npc.name, {
      name: npc.name,
      type: npc.type,
      position: npc.mesh.position.toArray(),
      age: npc.age,
      traits: npc.traits
    });
    
    // Register NPC coordinates in the coordinate index
    coordinateSystem.register('npc', npc.name, { x: npc.mesh.position.x, y: npc.mesh.position.y, z: npc.mesh.position.z });
    
    return npc;
  }

  getRandomTraits() {
    const allTraits = [
      'cheerful', 'grumpy', 'playful', 'serious',
      'active', 'lazy', 'creative', 'musical',
      'foodie', 'clumsy', 'neat', 'messy'
    ];
    const traits = new Set();
    while (traits.size < 3) {
      traits.add(allTraits[Math.floor(Math.random() * allTraits.length)]);
    }
    return Array.from(traits);
  }

  getNewRandomTarget(npc) {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 40,
      6 + 1.5,
      (Math.random() - 0.5) * 40
    );
  }

  updateNormalMovement(npc) {
    this.updateNeeds(npc);
    if (!npc.currentAction) {
      npc.currentAction = this.chooseAction(npc);
    }
    if (npc.currentAction) {
      this.executeAction(npc);
    }

    let target = this.movementTargets.get(npc.name);
    if (!target || this.hasReachedTarget(npc, target)) {
      target = this.getNewRandomTarget(npc);
      this.movementTargets.set(npc.name, target);
    }

    const direction = new THREE.Vector3()
      .subVectors(target, npc.mesh.position)
      .normalize();

    const moveSpeed = this.npcTypes[npc.type].speed * 0.05;
    const newX = npc.mesh.position.x + direction.x * moveSpeed;
    const newZ = npc.mesh.position.z + direction.z * moveSpeed;
    if (newX >= -20 && newX <= 20) {
      npc.mesh.position.x = newX;
    }
    if (newZ >= -20 && newZ <= 20) {
      npc.mesh.position.z = newZ;
    }
    
    npc.mesh.lookAt(
      npc.mesh.position.x + direction.x,
      npc.mesh.position.y,
      npc.mesh.position.z + direction.z
    );

    this.animateWalking(npc);
  }

  updateNeeds(npc) {
    npc.needs.hunger -= 0.01;
    npc.needs.energy -= 0.02;
    npc.needs.social -= 0.015;
    npc.needs.fun -= 0.02;
    npc.needs.hygiene -= 0.01;
    Object.keys(npc.needs).forEach(need => {
      npc.needs[need] = Math.max(0, Math.min(100, npc.needs[need]));
    });
    this.updateMood(npc);
  }

  updateMood(npc) {
    const averageNeeds = Object.values(npc.needs).reduce((a, b) => a + b) / 5;
    if (averageNeeds > 80) npc.mood = 'happy';
    else if (averageNeeds > 60) npc.mood = 'fine';
    else if (averageNeeds > 40) npc.mood = 'uncomfortable';
    else if (averageNeeds > 20) npc.mood = 'tense';
    else npc.mood = 'miserable';
  }

  chooseAction(npc) {
    const lowestNeed = Object.entries(npc.needs)
      .reduce((a, b) => a[1] < b[1] ? a : b);
    switch (lowestNeed[0]) {
      case 'hunger':
        return { type: 'eat', duration: 120 };
      case 'energy':
        return { type: 'rest', duration: 180 };
      case 'social':
        return { type: 'socialize', duration: 90 };
      case 'fun':
        return { type: 'play', duration: 60 };
      case 'hygiene':
        return { type: 'clean', duration: 45 };
      default:
        return { type: 'idle', duration: 30 };
    }
  }

  executeAction(npc) {
    if (!npc.currentAction) return;
    npc.currentAction.duration--;
    switch (npc.currentAction.type) {
      case 'eat':
        npc.needs.hunger += 0.5;
        break;
      case 'rest':
        npc.needs.energy += 0.3;
        break;
      case 'socialize':
        npc.needs.social += 0.4;
        this.handleSocialInteraction(npc);
        break;
      case 'play':
        npc.needs.fun += 0.6;
        break;
      case 'clean':
        npc.needs.hygiene += 0.7;
        break;
    }
    if (npc.currentAction.duration <= 0) {
      npc.currentAction = null;
    }
  }

  handleSocialInteraction(npc) {
    const nearbyNPCs = Array.from(this.npcs.values())
      .filter(other => other !== npc && 
        other.mesh.position.distanceTo(npc.mesh.position) < 3);
    nearbyNPCs.forEach(other => {
      if (!npc.relationships.has(other.name)) {
        npc.relationships.set(other.name, 0);
      }
      const currentRelationship = npc.relationships.get(other.name);
      const relationshipChange = Math.random() * 2 - 0.5;
      npc.relationships.set(other.name, 
        Math.max(-100, Math.min(100, currentRelationship + relationshipChange)));
      other.needs.social += 0.2;
    });
  }

  hasReachedTarget(npc, target) {
    const distance = npc.mesh.position.distanceTo(target);
    return distance < 0.5;
  }

  animateWalking(npc) {
    const walkSpeed = 0.005;
    const walkIntensity = 0.5;
    const leftLeg = npc.mesh.children[4];
    const rightLeg = npc.mesh.children[5];
    const leftArm = npc.mesh.children[2];
    const rightArm = npc.mesh.children[3];
    const walkCycle = Math.sin(Date.now() * walkSpeed);
    leftLeg.rotation.x = walkCycle * walkIntensity;
    rightLeg.rotation.x = -walkCycle * walkIntensity;
    leftArm.rotation.x = -walkCycle * (walkIntensity * 0.8);
    rightArm.rotation.x = walkCycle * (walkIntensity * 0.8);
    npc.mesh.rotation.z = Math.sin(Date.now() * walkSpeed * 2) * 0.05;
    npc.mesh.position.y = 6 + 1.5 + Math.abs(Math.sin(Date.now() * walkSpeed * 2)) * 0.1;
  }

  playBehavior(npc) {
    if (npc.type === 'child') {
      npc.mesh.position.y = 6 + 1.5 + Math.sin(Date.now() * 0.01) * 0.3;
      npc.mesh.rotation.y += Math.sin(Date.now() * 0.003) * 0.1;
    }
  }

  learnBehavior(npc) {
    if (npc.type === 'teacher') {
      const arms = [npc.mesh.children[2], npc.mesh.children[3]];
      arms.forEach(arm => {
        arm.rotation.z = Math.sin(Date.now() * 0.003) * 0.5;
        arm.rotation.x = Math.cos(Date.now() * 0.002) * 0.3;
      });
    } else if (npc.type === 'child') {
      npc.mesh.children[1].rotation.x = Math.sin(Date.now() * 0.002) * 0.2;
    }
  }

  restBehavior(npc) {
    npc.mesh.position.y = 6 + 1.5 + Math.sin(Date.now() * 0.001) * 0.1;
    npc.mesh.rotation.z = Math.sin(Date.now() * 0.001) * 0.05;
  }

  initializeFireEffect() {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = 15 + (Math.random() - 0.5);
      positions[i + 1] = 6 + Math.random() * 2;
      positions[i + 2] = -15 + (Math.random() - 0.5);

      colors[i] = 1;
      colors[i + 1] = Math.random() * 0.5;
      colors[i + 2] = 0;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    this.fireParticles = new THREE.Points(particles, particleMaterial);
    this.world.scene.add(this.fireParticles);

    const smokeParticleCount = 50;
    const smokeParticles = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeParticleCount * 3);
    const smokeColors = new Float32Array(smokeParticleCount * 3);

    for (let i = 0; i < smokeParticleCount * 3; i += 3) {
      smokePositions[i] = 15 + (Math.random() - 0.5) * 2;
      smokePositions[i + 1] = 7 + Math.random() * 3;
      smokePositions[i + 2] = -15 + (Math.random() - 0.5) * 2;

      const grey = 0.7 + Math.random() * 0.3;
      smokeColors[i] = grey;
      smokeColors[i + 1] = grey;
      smokeColors[i + 2] = grey;
    }

    smokeParticles.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeParticles.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));

    const smokeMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.3
    });

    this.smokeParticles = new THREE.Points(smokeParticles, smokeMaterial);
    this.world.scene.add(this.smokeParticles);
  }

  update() {
    this.npcs.forEach(npc => {
      this.updateNormalMovement(npc);
    });
  }
}