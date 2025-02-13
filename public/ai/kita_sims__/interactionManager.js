import * as THREE from 'three';

export class InteractionManager {
  constructor(world) {
    this.world = world;
    this.interactionPoints = new Map();
    this.currentInteractions = new Map();
    this.queuedInteractions = new Map();
    
    this.interactionTypes = {
      eat: {
        duration: 120,
        animation: 'eating',
        needsChange: { hunger: 40, social: 10 },
        allowedObjects: ['fridge', 'table'],
        allowMultiple: true,
        soundEffect: ''
      },
      sleep: {
        duration: 240,
        animation: 'sleeping',
        needsChange: { energy: 60 },
        allowedObjects: ['bed'],
        allowMultiple: false,
        soundEffect: ''
      },
      play: {
        duration: 90,
        animation: 'playing',
        needsChange: { fun: 30, energy: -10, social: 20 },
        allowedObjects: ['toybox', 'playground'],
        allowMultiple: true,
        soundEffect: ''
      },
      learn: {
        duration: 150,
        animation: 'learning',
        needsChange: { fun: -10, energy: -15 },
        allowedObjects: ['desk', 'bookshelf'],
        allowMultiple: true,
        soundEffect: ''
      },
      socialize: {
        duration: 60,
        animation: 'talking',
        needsChange: { social: 30, fun: 15 },
        allowedObjects: null,
        allowMultiple: true,
        soundEffect: ''
      },
      clean: {
        duration: 45,
        animation: 'cleaning',
        needsChange: { hygiene: 40, energy: -5 },
        allowedObjects: ['sink', 'shower'],
        allowMultiple: false,
        soundEffect: ''
      }
    };

    this.setupInteractionBubbles();
  }

  setupInteractionBubbles() {
    this.bubbleContainer = document.createElement('div');
    this.bubbleContainer.id = 'interaction-bubbles';
    document.body.appendChild(this.bubbleContainer);
  }

  requestInteraction(npc, type, targetObject = null) {
    const interactionConfig = this.interactionTypes[type];
    if (!interactionConfig) return false;

    if (interactionConfig.allowedObjects) {
      if (!targetObject || !interactionConfig.allowedObjects.includes(targetObject.type)) {
        return false;
      }
      if (targetObject.isOccupied && !interactionConfig.allowMultiple) {
        if (!this.queuedInteractions.has(targetObject)) {
          this.queuedInteractions.set(targetObject, []);
        }
        this.queuedInteractions.get(targetObject).push({ npc, type });
        return true;
      }
    }

    this.startInteraction(npc, type, targetObject);
    return true;
  }

  startInteraction(npc, type, targetObject = null) {
    const interactionConfig = this.interactionTypes[type];
    
    const interaction = {
      type,
      config: interactionConfig,
      progress: 0,
      targetObject,
      startTime: Date.now()
    };

    if (targetObject) {
      targetObject.isOccupied = true;
      targetObject.currentUser = npc;
    }

    this.currentInteractions.set(npc, interaction);
    
    this.showInteractionBubble(npc, type);
    
    if (npc.mesh) {
      this.startAnimation(npc, interactionConfig.animation);
    }
  }

  updateInteractions() {
    this.currentInteractions.forEach((interaction, npc) => {
      interaction.progress++;
      
      if (interaction.config.needsChange) {
        Object.entries(interaction.config.needsChange).forEach(([need, change]) => {
          const changePerTick = change / interaction.config.duration;
          npc.needs[need] = Math.max(0, Math.min(100, npc.needs[need] + changePerTick));
        });
      }

      if (interaction.progress >= interaction.config.duration) {
        this.completeInteraction(npc, interaction);
      }
    });
  }

  completeInteraction(npc, interaction) {
    this.currentInteractions.delete(npc);
    this.removeInteractionBubble(npc);
    
    if (interaction.targetObject) {
      interaction.targetObject.isOccupied = false;
      interaction.targetObject.currentUser = null;
      
      const queue = this.queuedInteractions.get(interaction.targetObject);
      if (queue && queue.length > 0) {
        const nextInteraction = queue.shift();
        this.startInteraction(nextInteraction.npc, nextInteraction.type, interaction.targetObject);
      }
    }

    this.stopAnimation(npc);
    
    this.triggerInteractionEffects(npc, interaction);
  }

  showInteractionBubble(npc, type) {
    const bubble = document.createElement('div');
    bubble.className = 'interaction-bubble';
    bubble.id = `bubble-${npc.name}`;
    bubble.innerHTML = this.interactionTypes[type].soundEffect;
    
    this.bubbleContainer.appendChild(bubble);
    
    this.updateBubblePosition(npc, bubble);
  }

  updateBubblePosition(npc, bubble) {
    if (!npc.mesh) return;
    
    const vector = npc.mesh.position.clone();
    vector.project(this.world.camera);
    
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
    
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y - 50}px`;
  }

  removeInteractionBubble(npc) {
    const bubble = document.getElementById(`bubble-${npc.name}`);
    if (bubble) {
      bubble.remove();
    }
  }

  startAnimation(npc, animationType) {
    if (!npc.mesh) return;
    
    switch(animationType) {
      case 'eating':
        this.animateEating(npc);
        break;
      case 'sleeping':
        this.animateSleeping(npc);
        break;
      case 'playing':
        this.animatePlaying(npc);
        break;
      case 'learning':
        this.animateLearning(npc);
        break;
      case 'talking':
        this.animateTalking(npc);
        break;
      case 'cleaning':
        this.animateCleaning(npc);
        break;
    }
  }

  animateEating(npc) {
    const head = npc.mesh.children[1];
    const arms = [npc.mesh.children[2], npc.mesh.children[3]];
    
    const animate = () => {
      if (!this.currentInteractions.has(npc)) return;
      
      head.position.y += Math.sin(Date.now() * 0.01) * 0.02;
      
      arms.forEach(arm => {
        arm.rotation.x = Math.sin(Date.now() * 0.01) * 0.5;
      });
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  animateSleeping(npc) {
    const body = npc.mesh.children[0];
    const head = npc.mesh.children[1];
    
    body.rotation.x = Math.PI / 2;
    head.rotation.x = Math.PI / 2;
    
    const animate = () => {
      if (!this.currentInteractions.has(npc)) return;
      
      body.scale.y = 1 + Math.sin(Date.now() * 0.002) * 0.05;
      
      requestAnimationFrame(animate);
    };
    animate();
  }

  animatePlaying(npc) {
    // Add animation for playing
  }

  animateLearning(npc) {
    // Add animation for learning
  }

  animateTalking(npc) {
    // Add animation for talking
  }

  animateCleaning(npc) {
    // Add animation for cleaning
  }

  stopAnimation(npc) {
    if (!npc.mesh) return;
    
    npc.mesh.children.forEach(part => {
      part.rotation.set(0, 0, 0);
      if (part !== npc.mesh.children[1]) {
        part.position.y = part.userData.originalY || 0;
      }
      part.scale.set(1, 1, 1);
    });
  }

  triggerInteractionEffects(npc, interaction) {
    if (interaction.targetObject) {
      this.createInteractionParticles(interaction.targetObject.mesh.position, interaction.type);
    }
    
    if (interaction.type === 'socialize') {
      this.updateRelationships(npc, interaction);
    }
  }

  createInteractionParticles(position, type) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = position.x + (Math.random() - 0.5) * 2;
      positions[i + 1] = position.y + Math.random() * 2;
      positions[i + 2] = position.z + (Math.random() - 0.5) * 2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: this.getParticleColor(type),
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, material);
    this.world.scene.add(particles);
    
    const animate = () => {
      const positions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.05;
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      material.opacity -= 0.02;
      
      if (material.opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        this.world.scene.remove(particles);
      }
    };
    animate();
  }

  getParticleColor(type) {
    const colors = {
      eat: 0xFFA500,
      sleep: 0x4169E1,
      play: 0xFF69B4,
      learn: 0x32CD32,
      socialize: 0xFFD700,
      clean: 0x87CEEB
    };
    return colors[type] || 0xFFFFFF;
  }

  updateRelationships(npc, interaction) {
    // Update relationships based on social interaction
  }
}