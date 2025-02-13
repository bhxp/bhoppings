import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class Terrain {
  constructor(scene) {
    if (!scene) {
      console.error('Scene is required for Terrain construction');
      return;
    }
    this.scene = scene;
    this.chunkSize = 200;
    this.visibleRadius = 3;
    this.chunks = new Map();
    this.lastChunkX = 0;
    this.lastChunkZ = 0;
    
    // Create road textures before using them
    this.roadTextures = this.createRoadTextures();
    
    // Initialize after textures are created
    this.preloadChunks();
    this.initSky();
  }

  preloadChunks() {
    if (!this.scene || !this.roadTextures) {
      console.error('Cannot preload chunks: scene or textures not initialized');
      return;
    }
    
    const radius = this.visibleRadius;
    for (let x = -radius; x <= radius; x++) {
      for (let z = -radius; z <= radius; z++) {
        const key = `${x},${z}`;
        const chunk = this.createChunk(x, z);
        if (chunk) {
          this.chunks.set(key, chunk);
        }
      }
    }
  }

  createChunk(x, z) {
    if (!this.scene || !this.roadTextures) {
      console.error('Cannot create chunk: scene or textures not initialized');
      return null;
    }
    
    const chunk = new THREE.Group();
    
    try {
      // Ground
      const groundGeometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x184d18,
        roughness: 0.9,
        metalness: 0.0
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.receiveShadow = true;
      ground.rotation.x = -Math.PI / 2;
      chunk.add(ground);

      // Main road
      const roadWidth = 10;
      const roadGeometry = new THREE.PlaneGeometry(roadWidth, this.chunkSize);
      const roadMaterial = new THREE.MeshStandardMaterial({
        map: this.roadTextures.road,
        roughness: 0.7,
        metalness: 0.2
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.receiveShadow = true;
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.01;
      chunk.add(road);

      // Road shoulders
      const shoulderWidth = 1.5;
      const shoulderGeometry = new THREE.PlaneGeometry(shoulderWidth, this.chunkSize);
      const shoulderMaterial = new THREE.MeshStandardMaterial({
        map: this.roadTextures.shoulder,
        roughness: 0.8,
        metalness: 0.1
      });

      // Left shoulder
      const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      leftShoulder.receiveShadow = true;
      leftShoulder.rotation.x = -Math.PI / 2;
      leftShoulder.position.set(-(roadWidth/2 + shoulderWidth/2), 0.01, 0);
      chunk.add(leftShoulder);

      // Right shoulder
      const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
      rightShoulder.receiveShadow = true;
      rightShoulder.rotation.x = -Math.PI / 2;
      rightShoulder.position.set(roadWidth/2 + shoulderWidth/2, 0.01, 0);
      chunk.add(rightShoulder);

      // Add guardrails and posts
      this.addGuardrails(chunk, roadWidth, shoulderWidth);
      
      // Add scenery
      this.addScenery(chunk);

      chunk.position.set(x * this.chunkSize, 0, z * this.chunkSize);
      this.scene.add(chunk);
      return chunk;
      
    } catch (error) {
      console.error('Error creating chunk:', error);
      return null;
    }
  }

  addGuardrails(chunk, roadWidth, shoulderWidth) {
    // Guardrail geometry and material
    const guardrailGeometry = new THREE.BoxGeometry(0.2, 0.8, this.chunkSize);
    const guardrailMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.3,
      metalness: 0.8
    });

    // Left guardrail
    const leftGuardrail = new THREE.Mesh(guardrailGeometry, guardrailMaterial);
    leftGuardrail.receiveShadow = true;
    leftGuardrail.position.set(-(roadWidth/2 + shoulderWidth + 0.1), 0.4, 0);
    chunk.add(leftGuardrail);

    // Right guardrail
    const rightGuardrail = new THREE.Mesh(guardrailGeometry, guardrailMaterial);
    rightGuardrail.receiveShadow = true;
    rightGuardrail.position.set(roadWidth/2 + shoulderWidth + 0.1, 0.4, 0);
    chunk.add(rightGuardrail);

    // Add posts
    const postGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const postMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      roughness: 0.7,
      metalness: 0.5
    });

    for (let i = -this.chunkSize/2; i <= this.chunkSize/2; i += 4) {
      // Left posts
      const leftPost = new THREE.Mesh(postGeometry, postMaterial);
      leftPost.receiveShadow = true;
      leftPost.position.set(-(roadWidth/2 + shoulderWidth + 0.1), 0.5, i);
      chunk.add(leftPost);

      // Right posts
      const rightPost = new THREE.Mesh(postGeometry, postMaterial);
      rightPost.receiveShadow = true;
      rightPost.position.set(roadWidth/2 + shoulderWidth + 0.1, 0.5, i);
      chunk.add(rightPost);
    }
  }

  initSky() {
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const uniforms = {
      topColor: { value: new THREE.Color(0x71c5ee) },
      bottomColor: { value: new THREE.Color(0xdcf5ff) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(10000, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.BackSide,
      fog: false 
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }

  createRoadTextures() {
    // Create road texture
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const ctx = roadCanvas.getContext('2d');

    // Dark asphalt base
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, 512, 512);

    // Add noise for texture
    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2;
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`;
      ctx.fillRect(x, y, size, size);
    }

    // Add lane markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.setLineDash([30, 30]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();

    const roadTexture = new THREE.CanvasTexture(roadCanvas);
    roadTexture.wrapS = THREE.RepeatWrapping;
    roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(1, 10);

    // Create shoulder texture
    const shoulderCanvas = document.createElement('canvas');
    shoulderCanvas.width = 128;
    shoulderCanvas.height = 128;
    const shoulderCtx = shoulderCanvas.getContext('2d');

    // Base color
    shoulderCtx.fillStyle = '#3c3c3c';
    shoulderCtx.fillRect(0, 0, 128, 128);

    // Add texture pattern
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      const size = Math.random() * 3;
      shoulderCtx.fillStyle = `rgba(60,60,60,${Math.random() * 0.5})`;
      shoulderCtx.fillRect(x, y, size, size);
    }

    const shoulderTexture = new THREE.CanvasTexture(shoulderCanvas);
    shoulderTexture.wrapS = THREE.RepeatWrapping;
    shoulderTexture.wrapT = THREE.RepeatWrapping;
    shoulderTexture.repeat.set(1, 10);

    return { road: roadTexture, shoulder: shoulderTexture };
  }

  addScenery(chunk) {
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() - 0.5) * this.chunkSize;
      const z = (Math.random() - 0.5) * this.chunkSize;
      
      if (Math.abs(x) > 7) {
        const tree = this.createTree();
        tree.position.set(x, 0, z);
        chunk.add(tree);
      }
    }

    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * this.chunkSize;
      const z = (Math.random() - 0.5) * this.chunkSize;
      
      if (Math.abs(x) > 7) {
        const rock = this.createRock();
        rock.position.set(x, 0, z);
        chunk.add(rock);
      }
    }
  }

  createTree() {
    const tree = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2f1b,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.receiveShadow = true;
    trunk.position.y = 2;
    tree.add(trunk);

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a4d1a,
      roughness: 0.8
    });

    [
      { size: 3, height: 4, y: 5 },
      { size: 2.5, height: 3, y: 6.5 },
      { size: 2, height: 2.5, y: 7.5 }
    ].forEach(({ size, height, y }) => {
      const layer = new THREE.Mesh(
        new THREE.ConeGeometry(size, height, 8),
        foliageMaterial
      );
      layer.receiveShadow = true;
      layer.position.y = y;
      tree.add(layer);
    });

    return tree;
  }

  createRock() {
    const rockGeometry = new THREE.DodecahedronGeometry(
      Math.random() * 1.5 + 0.5,
      0
    );
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.receiveShadow = true;
    return rock;
  }

  update(playerPosition) {
    const chunkX = Math.floor(playerPosition.x / this.chunkSize);
    const chunkZ = Math.floor(playerPosition.z / this.chunkSize);

    if (chunkX !== this.lastChunkX || chunkZ !== this.lastChunkZ) {
      for (const [key, chunk] of this.chunks) {
        const [x, z] = key.split(',').map(Number);
        if (Math.abs(x - chunkX) > this.visibleRadius || 
            Math.abs(z - chunkZ) > this.visibleRadius) {
          this.scene.remove(chunk);
          this.chunks.delete(key);
        }
      }

      for (let x = chunkX - this.visibleRadius; x <= chunkX + this.visibleRadius; x++) {
        for (let z = chunkZ - this.visibleRadius; z <= chunkZ + this.visibleRadius; z++) {
          const key = `${x},${z}`;
          if (!this.chunks.has(key)) {
            this.chunks.set(key, this.createChunk(x, z));
          }
        }
      }

      this.lastChunkX = chunkX;
      this.lastChunkZ = chunkZ;
    }
  }
}