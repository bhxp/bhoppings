import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/PointerLockControls.js';

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 2, 25); // Position player just outside the torii gate
    this.camera.lookAt(0, 2, 20); // Look at the torii gate
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new PointerLockControls(this.camera, document.body);
    
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = true;
    
    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    
    this.prevTime = performance.now();
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.lastDelta = 1/60; // Store last good delta for pause/unpause
    
    this.trees = [];  // Array to store tree data
    this.treeGrowthInterval = null;
    this.lastTreeSpawn = 0;
    this.treeSpawnDelay = 10000; // 10 seconds between tree spawns
    
    this.vines = new Map(); // Map to store vines for each tree
    this.vineGrowthInterval = null;
    
    // Add CatmullRomCurve3 for smooth vine paths
    this.vineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0)
    ]);
    
    this.snowflakes = [];
    this.petals = [];
    this.lanterns = [];
    this.lastPetalSpawn = 0;
    this.lastSnowSpawn = 0;
    
    this.init();
  }

  init() {
    // Create gradient sky background with winter colors
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
      topColor: { value: new THREE.Color(0x7c9ac7) },    // Winter blue
      bottomColor: { value: new THREE.Color(0xd8e6f6) }, // Light winter blue
      offset: { value: 33 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);

    // Enhanced Lighting for winter scene
    const ambientLight = new THREE.AmbientLight(0x8899bb, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 3, 2);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    
    this.scene.add(ambientLight);
    this.scene.add(directionalLight);

    // Snow-covered ground
    const floorGeometry = new THREE.CircleGeometry(100, 64);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Create temple structure
    this.createTemple();
    this.createToriiGate();
    this.createLanternPath();
    
    // Create cherry blossom trees
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      this.createCherryBlossomTree(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      );
    }

    // Rest of initialization
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Start tree growth system
    this.treeGrowthInterval = setInterval(() => this.updateTrees(), 2000);

    // Start vine growth system
    this.vineGrowthInterval = setInterval(() => this.updateVines(), 3000);

    // Spawn initial trees
    for (let i = 0; i < 10; i++) {
      this.spawnTree(
        Math.random() * 160 - 80,
        0.5,
        Math.random() * 160 - 80
      );
    }

    // Event listeners
    document.addEventListener('click', (event) => this.onClick(event));
    document.addEventListener('contextmenu', (event) => this.onRightClick(event));
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    window.addEventListener('resize', () => this.onWindowResize());

    // Start animation loop
    this.animate();
  }

  createTemple() {
    const templeGroup = new THREE.Group();

    // Main temple building materials
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const darkWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5e6d3,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4a4a,
      roughness: 0.7,
      metalness: 0.2,
      side: THREE.DoubleSide
    });

    // Foundation platform - slightly wider than walls
    const foundationGeometry = new THREE.BoxGeometry(17.2, 1, 22.2);
    const foundation = new THREE.Mesh(foundationGeometry, darkWoodMaterial);
    foundation.position.set(0, 0.5, -10);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    templeGroup.add(foundation);

    // Steps - moved slightly forward
    const stepGeometry = new THREE.BoxGeometry(8, 0.5, 2);
    const steps = new THREE.Mesh(stepGeometry, darkWoodMaterial);
    steps.position.set(0, 0.75, 1.1);
    steps.castShadow = true;
    steps.receiveShadow = true;
    templeGroup.add(steps);

    // Main walls - slightly smaller than foundation
    const wallGeometry = new THREE.BoxGeometry(15, 10, 20);
    const walls = new THREE.Mesh(wallGeometry, wallMaterial);
    walls.position.set(0, 5.5, -10);
    walls.castShadow = true;
    walls.receiveShadow = true;
    templeGroup.add(walls);

    // Wooden pillars at corners - moved slightly outward
    const pillarGeometry = new THREE.BoxGeometry(1, 10, 1);
    const pillarPositions = [
      [-7.6, 5.5, -20.1],
      [7.6, 5.5, -20.1],
      [-7.6, 5.5, 0.1],
      [7.6, 5.5, 0.1]
    ];

    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(pillarGeometry, woodMaterial);
      pillar.position.set(...pos);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      templeGroup.add(pillar);
    });

    // Decorative horizontal beams - adjusted positions
    const beamGeometry = new THREE.BoxGeometry(17, 0.5, 0.5);
    const beamPositions = [1, 3, 6, 9].map(y => [0, y, -20.2]);
  
    beamPositions.forEach(pos => {
      const beam = new THREE.Mesh(beamGeometry, woodMaterial);
      beam.position.set(...pos);
      beam.castShadow = true;
      beam.receiveShadow = true;
      templeGroup.add(beam);
    });

    // Updated multi-layered roof system
    const roofLayers = [
      { size: 18, height: 8, y: 13 },
      { size: 16, height: 7, y: 15 },
      { size: 14, height: 6, y: 17 },
      { size: 12, height: 5, y: 19 },
      { size: 10, height: 4, y: 21 }
    ];

    roofLayers.forEach((layer, index) => {
      const roofGeometry = new THREE.ConeGeometry(layer.size, layer.height, 4);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, layer.y, -10);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      roof.receiveShadow = true;
      templeGroup.add(roof);

      // Add decorative roof edges
      const edgeGeometry = new THREE.BoxGeometry(layer.size * 1.4, 0.3, layer.size * 1.4);
      const edge = new THREE.Mesh(edgeGeometry, darkWoodMaterial);
      edge.position.set(0, layer.y - layer.height/2 + 0.15, -10);
      edge.rotation.y = Math.PI / 4;
      edge.castShadow = true;
      edge.receiveShadow = true;
      templeGroup.add(edge);

      // Add curved roof corners
      for (let i = 0; i < 4; i++) {
        const cornerGeometry = new THREE.CylinderGeometry(0.4, 0.4, layer.size * 0.7, 8);
        const corner = new THREE.Mesh(cornerGeometry, darkWoodMaterial);
        const angle = (i * Math.PI / 2) + Math.PI / 4;
        const radius = layer.size * 0.7;
        corner.position.set(
          Math.cos(angle) * radius,
          layer.y - layer.height/2,
          -10 + Math.sin(angle) * radius
        );
        corner.rotation.x = Math.PI / 2;
        corner.rotation.z = angle;
        corner.castShadow = true;
        corner.receiveShadow = true;
        templeGroup.add(corner);
      }
    });

    // Updated ornament position for new roof height
    const ornamentGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const ornamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8860b,
      metalness: 0.8,
      roughness: 0.2
    });

    const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
    ornament.position.set(0, 23, -10);  // Adjusted height
    ornament.castShadow = true;
    ornament.receiveShadow = true;
    templeGroup.add(ornament);

    // Sliding doors - adjusted positions
    const doorGeometry = new THREE.PlaneGeometry(3, 8);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2b48c,
      roughness: 0.7,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const doorPositions = [
      [-2, 4.5, 0.15],
      [2, 4.5, 0.15]
    ];

    doorPositions.forEach(pos => {
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(...pos);
      door.castShadow = true;
      door.receiveShadow = true;
      templeGroup.add(door);
    });

    // Windows - adjusted positions
    const windowGeometry = new THREE.PlaneGeometry(2, 2);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      roughness: 0.5,
      metalness: 0.2,
      opacity: 0.7,
      transparent: true,
      side: THREE.DoubleSide
    });

    const windowPositions = [
      [-5, 6, 0.2],
      [5, 6, 0.2],
      [-5, 6, -20.2],
      [5, 6, -20.2]
    ];

    windowPositions.forEach(pos => {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(...pos);
      window.castShadow = true;
      window.receiveShadow = true;
      templeGroup.add(window);
    });

    // Decorative patterns - adjusted positions
    const patternGeometry = new THREE.PlaneGeometry(1, 1);
    const patternMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      side: THREE.DoubleSide
    });

    for (let x = -6; x <= 6; x += 2) {
      for (let y = 2; y <= 8; y += 2) {
        const pattern = new THREE.Mesh(patternGeometry, patternMaterial);
        pattern.position.set(x, y, 0.25);
        templeGroup.add(pattern);

        const backPattern = pattern.clone();
        backPattern.position.z = -20.25;
        templeGroup.add(backPattern);
      }
    }

    this.scene.add(templeGroup);
  }

  createToriiGate() {
    const toriiGroup = new THREE.Group();

    // Create richer materials with better visual properties
    const woodMaterial = new THREE.MeshStandardMaterial({
      color: 0xc41e3a, // Traditional vermillion red
      roughness: 0.8,
      metalness: 0.1
    });

    const blackMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.2
    });

    // Main posts (hashira)
    const postGeometry = new THREE.CylinderGeometry(0.6, 0.7, 16, 12);
    const post1 = new THREE.Mesh(postGeometry, woodMaterial);
    const post2 = new THREE.Mesh(postGeometry, woodMaterial);
    post1.position.set(-5, 8, 20);
    post2.position.set(5, 8, 20);
  
    // Add base stone foundations
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 12);
    const base1 = new THREE.Mesh(baseGeometry, blackMaterial);
    const base2 = new THREE.Mesh(baseGeometry, blackMaterial);
    base1.position.set(-5, 0.5, 20);
    base2.position.set(5, 0.5, 20);

    // Top beam (kasagi)
    const topBeamGeometry = new THREE.BoxGeometry(13, 1, 2);
    const topBeam = new THREE.Mesh(topBeamGeometry, woodMaterial);
    topBeam.position.set(0, 15.5, 20);
  
    // Add curved ends to top beam
    const curveGeometry = new THREE.CylinderGeometry(0.5, 0.5, 13, 8, 1, false, 0, Math.PI);
    const topCurve = new THREE.Mesh(curveGeometry, woodMaterial);
    topCurve.rotation.z = Math.PI / 2;
    topCurve.position.set(0, 16, 20);

    // Secondary beam (nuki)
    const secondBeamGeometry = new THREE.BoxGeometry(11.5, 0.8, 1.5);
    const secondBeam = new THREE.Mesh(secondBeamGeometry, woodMaterial);
    secondBeam.position.set(0, 14, 20);

    // Support blocks (daiwa)
    const supportGeometry = new THREE.BoxGeometry(0.8, 0.8, 2);
    const support1 = new THREE.Mesh(supportGeometry, woodMaterial);
    const support2 = new THREE.Mesh(supportGeometry, woodMaterial);
    support1.position.set(-5, 14.8, 20);
    support2.position.set(5, 14.8, 20);

    // Tie beams (shimaki)
    const tieBeamGeometry = new THREE.BoxGeometry(0.4, 1.2, 1.8);
    const tie1 = new THREE.Mesh(tieBeamGeometry, woodMaterial);
    const tie2 = new THREE.Mesh(tieBeamGeometry, woodMaterial);
    tie1.position.set(-5, 13, 20);
    tie2.position.set(5, 13, 20);

    // Decorative elements
    const ringGeometry = new THREE.TorusGeometry(0.8, 0.2, 16, 32);
    const ring1 = new THREE.Mesh(ringGeometry, blackMaterial);
    const ring2 = new THREE.Mesh(ringGeometry, blackMaterial);
    ring1.rotation.x = Math.PI / 2;
    ring2.rotation.x = Math.PI / 2;
    ring1.position.set(-5, 11, 20);
    ring2.position.set(5, 11, 20);

    // Add all elements to group
    const elements = [
      post1, post2, base1, base2, topBeam, topCurve,
      secondBeam, support1, support2, tie1, tie2,
      ring1, ring2
    ];

    // Add shadows to all elements
    elements.forEach(element => {
      element.castShadow = true;
      element.receiveShadow = true;
      toriiGroup.add(element);
    });

    // Add subtle ambient occlusion effect with a darker material underneath joints
    const jointGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 12);
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 1.0
    });

    // Add joints at key intersections
    const jointPositions = [
      {x: -5, y: 14, z: 20},
      {x: 5, y: 14, z: 20},
      {x: -5, y: 15.5, z: 20},
      {x: 5, y: 15.5, z: 20}
    ];

    jointPositions.forEach(pos => {
      const joint = new THREE.Mesh(jointGeometry, jointMaterial);
      joint.position.set(pos.x, pos.y, pos.z);
      toriiGroup.add(joint);
    });

    this.scene.add(toriiGroup);
  }

  createLanternPath() {
    const lanternLight = new THREE.PointLight(0xffcc77, 0.5, 10);
  
    // Create more detailed lantern geometry
    const baseGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8);
    const mainGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const topGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.3, 8);
    const roofGeometry = new THREE.ConeGeometry(0.4, 0.3, 8);
  
    // Create materials with better visual properties
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,  // Wood color
      roughness: 0.8,
      metalness: 0.1
    });
  
    const paperMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffaf0,  // Warm white
      emissive: 0xffcc77,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.9,
      roughness: 0.3
    });

    // Create decorative ring geometry
    const ringGeometry = new THREE.TorusGeometry(0.32, 0.02, 8, 16);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7,
      metalness: 0.3
    });

    // Temple dimensions for collision checking
    const templeWidth = 17.2;  // Foundation width
    const templeLength = 22.2; // Foundation length
    const templeStart = -20.1; // Back of temple (z-coordinate)

    for (let i = 0; i < 10; i++) {
      // Create lantern group to hold all parts
      const lanternGroup = new THREE.Group();
      
      // Create lantern parts
      const base = new THREE.Mesh(baseGeometry, frameMaterial);
      const main = new THREE.Mesh(mainGeometry, paperMaterial);
      const top = new THREE.Mesh(topGeometry, frameMaterial);
      const roof = new THREE.Mesh(roofGeometry, frameMaterial);
      
      // Create decorative rings
      const bottomRing = new THREE.Mesh(ringGeometry, ringMaterial);
      const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
      
      // Position parts
      base.position.y = 0;
      main.position.y = 0.75;
      top.position.y = 1.5;
      roof.position.y = 1.8;
      bottomRing.position.y = 0.2;
      topRing.position.y = 1.3;
      
      // Add shadow casting
      [base, main, top, roof, bottomRing, topRing].forEach(part => {
        part.castShadow = true;
        part.receiveShadow = true;
      });
      
      // Add all parts to group
      lanternGroup.add(base, main, top, roof, bottomRing, topRing);
      
      // Create and position light
      const light = lanternLight.clone();
      light.position.y = 0.75;  // Center of main body
      lanternGroup.add(light);
      
      // Calculate z position
      const zPos = 18 - i * 4;
      
      // Check if lantern would intersect with temple
      const intersectsTemple = (x, z) => {
        const halfWidth = templeWidth / 2;
        return Math.abs(x) <= halfWidth && 
               z >= templeStart && 
               z <= templeStart + templeLength;
      };

      // Position left lantern
      const leftLantern = lanternGroup.clone();
      if (intersectsTemple(-3, zPos)) {
        // Raise lantern to temple floor level
        leftLantern.position.set(-3, 1.15, zPos);
      } else {
        leftLantern.position.set(-3, 0.15, zPos);
      }
      this.scene.add(leftLantern);
      this.lanterns.push({ mesh: leftLantern, light: light.clone() });
      
      // Position right lantern
      const rightLantern = lanternGroup.clone();
      if (intersectsTemple(3, zPos)) {
        // Raise lantern to temple floor level
        rightLantern.position.set(3, 1.15, zPos);
      } else {
        rightLantern.position.set(3, 0.15, zPos);
      }
      this.scene.add(rightLantern);
      this.lanterns.push({ mesh: rightLantern, light: light.clone() });
      
      // Add kanji character decoration (using custom geometry)
      const kanjiGeometry = this.createKanjiGeometry();
      const kanjiMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513,
        roughness: 0.8
      });
      
      // Adjust kanji positions to match lantern positions
      const leftKanji = new THREE.Mesh(kanjiGeometry, kanjiMaterial);
      leftKanji.scale.set(0.2, 0.2, 0.02);
      leftKanji.position.set(
        leftLantern.position.x - 0.31,
        0.75,
        zPos
      );
      this.scene.add(leftKanji);
      
      const rightKanji = leftKanji.clone();
      rightKanji.position.set(
        rightLantern.position.x - 0.31,
        0.75,
        zPos
      );
      this.scene.add(rightKanji);
    }
  }

  createKanjiGeometry() {
    // Create a simple geometric kanji-like shape
    const shape = new THREE.Shape();
  
    // Draw a simplified "光" (light) kanji
    shape.moveTo(0, 1);
    shape.lineTo(1, 1);
    shape.lineTo(0.5, 0);
    shape.lineTo(0, 1);
  
    shape.moveTo(0.2, 0.6);
    shape.lineTo(0.8, 0.6);
  
    shape.moveTo(0.5, 1);
    shape.lineTo(0.5, 0);
  
    const geometry = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.1,
      bevelEnabled: false
    });
  
    return geometry;
  }

  createCherryBlossomTree(x, y, z) {
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 8, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2f1b,
      roughness: 1.0,
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 4, z);
    this.scene.add(trunk);

    // Create branches with blossoms
    const blossomGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const blossomMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb7c5,
      roughness: 0.5,
    });

    for (let i = 0; i < 50; i++) {
      const blossom = new THREE.Mesh(blossomGeometry, blossomMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 2;
      const height = 6 + Math.random() * 4;
      
      blossom.position.set(
        x + Math.cos(angle) * radius,
        y + height,
        z + Math.sin(angle) * radius
      );
      
      this.scene.add(blossom);
    }
  }

  spawnTree(x, y, z) {
    const tree = {
      position: new THREE.Vector3(x, y, z),
      blocks: [],
      branches: [],
      growth: 0,
      maxHeight: Math.floor(Math.random() * 5) + 5,
      hasLeaves: false
    };
    
    // Create trunk base
    const trunkBlock = this.spawnTreeBlock(x, y, z, 'trunk');
    tree.blocks.push(trunkBlock);
    tree.branches.push({
      parent: null,
      block: trunkBlock,
      children: [],
      direction: new THREE.Vector3(0, 1, 0),
      level: 0
    });
    
    this.trees.push(tree);
    
    // Initialize vine data for this tree
    this.vines.set(tree, {
      points: [],
      meshes: [],
      growth: 0,
      maxGrowth: Math.floor(Math.random() * 5) + 3
    });
  }

  updateTrees() {
    const now = performance.now();
    
    // Spawn new tree every 10 seconds
    if (now - this.lastTreeSpawn > this.treeSpawnDelay) {
      this.spawnTree(
        Math.random() * 160 - 80,
        0.5,
        Math.random() * 160 - 80
      );
      this.lastTreeSpawn = now;
    }

    // Grow existing trees
    for (const tree of this.trees) {
      if (tree.growth < tree.maxHeight) {
        this.growTree(tree);
        tree.growth++;
      } else if (!tree.hasLeaves) {
        this.addLeaves(tree);
        tree.hasLeaves = true;
      }
    }

    // Limit total number of trees
    if (this.trees.length > 30) {
      const oldestTree = this.trees.shift();
      oldestTree.blocks.forEach(block => this.scene.remove(block));
      
      // Clean up vines for removed tree
      const vineData = this.vines.get(oldestTree);
      if (vineData) {
        vineData.meshes.forEach(mesh => this.scene.remove(mesh));
        this.vines.delete(oldestTree);
      }
    }
  }

  growTree(tree) {
    // Process each active branch
    const activeBranches = [...tree.branches];
    const newBranches = [];

    for (const branch of activeBranches) {
      // Continue growing the current branch
      const newPos = branch.block.position.clone().add(
        branch.direction.clone().multiplyScalar(1)
      );
      
      const newBlock = this.spawnTreeBlock(
        newPos.x,
        newPos.y,
        newPos.z,
        'trunk'
      );

      // Apply rotation to match branch direction
      newBlock.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        branch.direction
      );
      
      tree.blocks.push(newBlock);
      
      const newBranch = {
        parent: branch,
        block: newBlock,
        children: [],
        direction: branch.direction.clone(),
        level: branch.level
      };
      
      branch.children.push(newBranch);
      newBranches.push(newBranch);

      // Chance to create new branches
      if (branch.level < 3 && Math.random() < 0.3) {
        const numNewBranches = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numNewBranches; i++) {
          // Create a new direction vector that's angled away from the parent
          const angle = Math.random() * Math.PI * 2;
          const tilt = Math.random() * 0.7 + 0.3; // Angle upward between 0.3 and 1.0 radians
          
          const newDirection = new THREE.Vector3(
            Math.cos(angle) * Math.sin(tilt),
            Math.cos(tilt),
            Math.sin(angle) * Math.sin(tilt)
          ).normalize();

          const branchBlock = this.spawnTreeBlock(
            newPos.x,
            newPos.y,
            newPos.z,
            'trunk'
          );

          // Scale down branch size based on level
          const scale = Math.pow(0.8, branch.level + 1);
          branchBlock.scale.set(scale, scale, scale);
          
          // Apply rotation to match branch direction
          branchBlock.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            newDirection
          );

          tree.blocks.push(branchBlock);
          
          const newBranch = {
            parent: branch,
            block: branchBlock,
            children: [],
            direction: newDirection,
            level: branch.level + 1
          };
          
          branch.children.push(newBranch);
          newBranches.push(newBranch);
        }
      }
    }

    // Update the tree's branches array with the new set
    tree.branches = newBranches;
  }

  addLeaves(tree) {
    // Add leaves to end of each branch
    for (const branch of tree.branches) {
      if (branch.children.length === 0) { // Only add leaves to terminal branches
        const pos = branch.block.position;
        const scale = Math.pow(0.8, branch.level);
        
        // Create leaf cluster
        const leafCount = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < leafCount; i++) {
          const angle = (i / leafCount) * Math.PI * 2;
          const radius = 0.5 * scale;
          
          const leaf = this.spawnTreeBlock(
            pos.x + Math.cos(angle) * radius,
            pos.y + 0.5,
            pos.z + Math.sin(angle) * radius,
            'leaves'
          );
          
          // Scale leaves based on branch level
          leaf.scale.set(scale, scale, scale);
          
          tree.blocks.push(leaf);
        }
      }
    }
  }

  spawnTreeBlock(x, y, z, type = 'trunk') {
    let geometry, material;
    
    if (type === 'trunk') {
      // Trunk/branch is a cylinder
      geometry = new THREE.CylinderGeometry(0.2, 0.25, 1, 8);
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4a2f1b),
        roughness: 1.0,
        metalness: 0.0
      });
    } else {
      // Leaves are spheres
      geometry = new THREE.SphereGeometry(0.6, 8, 8);
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x2d5a27),
        roughness: 1.0,
        metalness: 0.0
      });
    }

    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    block.userData.isTree = true;
    block.userData.type = type;
    
    this.scene.add(block);
    return block;
  }

  updateVines() {
    for (const [tree, vineData] of this.vines.entries()) {
      // Only grow vines on trees that have some height
      if (tree.growth > 2 && vineData.growth < vineData.maxGrowth && vineData.growth < tree.growth) {
        vineData.growth++;
        this.addVineSegment(tree, vineData);
      }
    }
  }

  addVineSegment(tree, vineData) {
    const trunkBlock = tree.blocks[vineData.growth];
    if (!trunkBlock) return;

    const radius = 0.05;
    const segmentHeight = 1;
    
    // Calculate winding position around trunk
    const angle = (vineData.growth * Math.PI * 0.5) + (Math.random() * Math.PI * 0.2);
    const trunkRadius = 0.3;
    
    const x = trunkBlock.position.x + Math.cos(angle) * trunkRadius;
    const z = trunkBlock.position.z + Math.sin(angle) * trunkRadius;
    const y = trunkBlock.position.y;

    vineData.points.push(new THREE.Vector3(x, y, z));

    // Create smooth curve through points
    if (vineData.points.length >= 2) {
      const curve = new THREE.CatmullRomCurve3(vineData.points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 8, radius, 8, false);
      
      // Create organic-looking vine material
      const vineMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x2d5a27),
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true
      });

      const vineMesh = new THREE.Mesh(tubeGeometry, vineMaterial);
      vineMesh.castShadow = true;
      vineMesh.receiveShadow = true;
      
      // Remove old vine mesh if it exists
      if (vineData.meshes.length > 0) {
        this.scene.remove(vineData.meshes[vineData.meshes.length - 1]);
        vineData.meshes.pop();
      }
      
      vineData.meshes.push(vineMesh);
      this.scene.add(vineMesh);
    }
  }

  spawnPetal() {
    const petal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.2),
      new THREE.MeshStandardMaterial({
        color: 0xffb7c5,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    );

    petal.position.set(
      Math.random() * 100 - 50,
      20,
      Math.random() * 100 - 50
    );
    
    petal.rotation.x = Math.random() * Math.PI;
    petal.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      -0.5,
      (Math.random() - 0.5) * 0.5
    );
    
    this.scene.add(petal);
    this.petals.push(petal);
  }

  spawnSnowflake() {
    const snowflake = new THREE.Mesh(
      new THREE.PlaneGeometry(0.1, 0.1),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      })
    );

    snowflake.position.set(
      Math.random() * 100 - 50,
      20,
      Math.random() * 100 - 50
    );
    
    snowflake.rotation.x = Math.random() * Math.PI;
    snowflake.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      -0.3,
      (Math.random() - 0.5) * 0.2
    );
    
    this.scene.add(snowflake);
    this.snowflakes.push(snowflake);
  }

  updateParticles() {
    // Update petals
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const petal = this.petals[i];
      petal.position.add(petal.velocity);
      petal.rotation.x += 0.02;
      petal.rotation.y += 0.01;

      if (petal.position.y < 0) {
        this.scene.remove(petal);
        this.petals.splice(i, 1);
      }
    }

    // Update snowflakes
    for (let i = this.snowflakes.length - 1; i >= 0; i--) {
      const snowflake = this.snowflakes[i];
      snowflake.position.add(snowflake.velocity);
      snowflake.rotation.x += 0.01;
      snowflake.rotation.y += 0.01;

      if (snowflake.position.y < 0) {
        this.scene.remove(snowflake);
        this.snowflakes.splice(i, 1);
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Animate lantern lights
    this.lanterns.forEach(lantern => {
      lantern.light.intensity = 0.5 + Math.sin(performance.now() * 0.002) * 0.1;
    });

    // Spawn falling petals
    if (performance.now() - this.lastPetalSpawn > 100) {
      this.spawnPetal();
      this.lastPetalSpawn = performance.now();
    }

    // Spawn snowflakes
    if (performance.now() - this.lastSnowSpawn > 50) {
      this.spawnSnowflake();
      this.lastSnowSpawn = performance.now();
    }

    // Update falling petals and snow
    this.updateParticles();

    if (this.controls.isLocked) {
      const time = performance.now();
      let delta = (time - this.prevTime) / 1000;
      
      // Prevent huge physics steps after unpause
      if (delta > 0.1) {
        delta = this.lastDelta;
      }
      this.lastDelta = delta;

      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 10.0 * delta;

      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize();

      if (this.moveForward || this.moveBackward) {
        this.velocity.z -= this.direction.z * 400.0 * delta;
      }
      if (this.moveLeft || this.moveRight) {
        this.velocity.x -= this.direction.x * 400.0 * delta;
      }

      this.controls.moveRight(-this.velocity.x * delta);
      this.controls.moveForward(-this.velocity.z * delta);

      this.camera.position.y += this.velocity.y * delta;

      if (this.camera.position.y < 2) {
        this.velocity.y = 0;
        this.camera.position.y = 2;
        this.canJump = true;
      }

      this.updatePosition();
      this.prevTime = time;
    } else {
      // When paused, just update the previous time without processing physics
      this.prevTime = performance.now();
    }

    this.updateFPS();
    this.renderer.render(this.scene, this.camera);
  }

  onClick(event) {
    if (!this.controls.isLocked) {
      this.controls.lock();
      return;
    }
  }

  onRightClick(event) {
    event.preventDefault();
    if (!this.controls.isLocked) return;
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y += 20;
          this.canJump = false;
        }
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'ArrowLeft':
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.moveRight = false;
        break;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  updatePosition() {
    const pos = this.camera.position;
    
    // Temple dimensions
    const templeWidth = 17.2;  // Foundation width
    const templeLength = 22.2; // Foundation length
    const templeStart = -20.1; // Back of temple (z-coordinate)
    
    // Check if player is within temple bounds
    const inTemple = (
      Math.abs(pos.x) <= templeWidth/2 && 
      pos.z >= templeStart && 
      pos.z <= templeStart + templeLength
    );
    
    // If in temple and below floor level + player height, raise to floor level
    if (inTemple && pos.y < 3.15) { // 1.15 (floor height) + 2 (default player height)
      this.camera.position.y = 3.15;
      this.velocity.y = 0;
      this.canJump = true;
    }
    
    document.getElementById('position').textContent = 
      `X: ${pos.x.toFixed(2)} Y: ${pos.y.toFixed(2)} Z: ${pos.z.toFixed(2)}`;
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

}

// Start the game
new Game();