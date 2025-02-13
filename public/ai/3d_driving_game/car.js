import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export class Car {
  constructor(scene, id, username = null) {
    this.scene = scene;
    this.id = id;
    
    // If no username is provided, keep the random generation
    this.username = username || this.generatePlayerUsername();
    
    this.wheels = []; // Front wheels only (index 0, 1)
    this.backWheels = []; // Back wheels only (index 2, 3)
    this.mesh = this.createCarMesh();
    this.nameTag = this.createNameTag();
    this.velocity = new THREE.Vector3();
    this.acceleration = 0;
    this.steering = 0;
    this.wheelRotation = 0;
    
    // Max speed 100 km/h (approximately 27.78 m/s in our scale)
    this.maxSpeed = 27.78; 
    // Max reverse speed 40 km/h (approximately 11.11 m/s)
    this.maxReverseSpeed = 11.11;
    
    this.accelerationRate = 20; 
    this.brakingRate = 40; 
    this.steeringRate = 6.0; 
    this.friction = 0.98;
    this.steeringFriction = 0.92; 
    
    // Maximum angle for wheel turning (in radians)
    this.maxWheelTurn = Math.PI / 4;
    
    // Add collision box
    this.collisionBox = new THREE.Box3();
    this.nameTagOffset = 4; // Increased from previous versions to raise the nametag
  }

  generatePlayerUsername() {
    // More realistic player-like usernames
    const prefixes = [
      'Road', 'Street', 'Highway', 'Track', 'Lane', 'Drive', 'Path', 
      'Trail', 'Way', 'Route', 'Journey', 'Cruise', 'Ride', 'Trip'
    ];
    const suffixes = [
      'Rider', 'Driver', 'Traveler', 'Explorer', 'Voyager', 'Wanderer', 
      'Navigator', 'Pilot', 'Adventurer', 'Roamer', 'Cruiser'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 100);

    return `${prefix}${suffix}${number}`;
  }

  createNameTag() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Text
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(this.username, canvas.width / 2, canvas.height / 2 + 10);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const nameTagSprite = new THREE.Sprite(spriteMaterial);
    
    nameTagSprite.scale.set(5, 1.5, 1);
    this.scene.add(nameTagSprite);
    
    return nameTagSprite;
  }

  updateNameTagPosition() {
    if (this.nameTag && this.mesh) {
      const carPosition = this.mesh.position.clone();
      this.nameTag.position.set(
        carPosition.x, 
        carPosition.y + this.nameTagOffset,  
        carPosition.z
      );
    }
  }

  createCarMesh() {
    const carGroup = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3366cc,
      roughness: 0.6,
      metalness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    body.position.y = 1.5;
    carGroup.add(body);

    // Car cabin
    const cabinGeometry = new THREE.BoxGeometry(3, 1.2, 4);
    const cabinMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.1,
      metalness: 0.9
    });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    cabin.position.y = 2.6;
    cabin.position.z = -0.5;
    carGroup.add(cabin);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      roughness: 0.8,
      metalness: 0.1
    });
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelPositions = [
      { x: -2, y: 0.7, z: 2.5 },  // Front left
      { x: 2, y: 0.7, z: 2.5 },   // Front right
      { x: -2, y: 0.7, z: -2.5 }, // Back left
      { x: 2, y: 0.7, z: -2.5 }   // Back right
    ];

    wheelPositions.forEach((pos, index) => {
      const wheelGroup = new THREE.Group(); // Create a group for each wheel
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheelGroup.add(wheel);
      wheelGroup.position.set(pos.x, pos.y, pos.z);
      carGroup.add(wheelGroup);
      
      if (index < 2) {
        // Front wheels
        this.wheels.push(wheelGroup);
      } else {
        // Back wheels
        this.backWheels.push(wheelGroup);
      }
    });

    // Headlights
    const headlightGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
    const headlightMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 1.0,
      roughness: 0.1,
      metalness: 0.9
    });

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-1.5, 1.5, 4);
    leftHeadlight.castShadow = true;
    carGroup.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    rightHeadlight.position.set(1.5, 1.5, 4);
    rightHeadlight.castShadow = true;
    carGroup.add(rightHeadlight);

    // Headlight illumination
    const leftLight = new THREE.SpotLight(0xffffcc, 2);
    leftLight.position.copy(leftHeadlight.position);
    leftLight.target.position.set(
      leftLight.position.x - 5,
      0,
      leftLight.position.z + 10
    );
    leftLight.angle = Math.PI / 6;
    leftLight.penumbra = 0.3;
    leftLight.decay = 2;
    leftLight.distance = 30;
    carGroup.add(leftLight);
    carGroup.add(leftLight.target);

    const rightLight = new THREE.SpotLight(0xffffcc, 2);
    rightLight.position.copy(rightHeadlight.position);
    rightLight.target.position.set(
      rightLight.position.x + 5,
      0,
      rightLight.position.z + 10
    );
    rightLight.angle = Math.PI / 6;
    rightLight.penumbra = 0.3;
    rightLight.decay = 2;
    rightLight.distance = 30;
    carGroup.add(rightLight);
    carGroup.add(rightLight.target);

    this.scene.add(carGroup);
    return carGroup;
  }

  update(delta, controls) {
    if (controls) {
      // Update acceleration based on controls
      if (controls.accelerate) {
        this.acceleration += this.accelerationRate * delta;
        // Limit forward speed to maxSpeed
        if (this.acceleration > this.maxSpeed) {
          this.acceleration = this.maxSpeed;
        }
      }
      if (controls.brake) {
        this.acceleration -= this.brakingRate * delta;
        // Limit reverse speed to maxReverseSpeed
        if (this.acceleration < -this.maxReverseSpeed) {
          this.acceleration = -this.maxReverseSpeed;
        }
      }
      
      // Apply friction
      this.acceleration *= this.friction;
      this.steering *= this.steeringFriction;

      // Update steering
      const steeringMultiplier = Math.abs(this.acceleration) > 5 ? 1 : 0.7;
      if (controls.turnLeft) this.steering += this.steeringRate * delta * steeringMultiplier;
      if (controls.turnRight) this.steering -= this.steeringRate * delta * steeringMultiplier;

      // Clamp steering
      this.steering = Math.max(-1.5, Math.min(1.5, this.steering));

      // Update position and rotation
      const turnFactor = 1.8; 
      this.mesh.rotation.y += this.steering * (this.acceleration / this.maxSpeed) * delta * turnFactor;
      const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
      this.mesh.position.addScaledVector(direction, this.acceleration * delta);

      // Update wheel rotations
      // Forward/backward rotation
      this.wheelRotation += this.acceleration * delta;
      
      // Update steering angle for front wheels
      const wheelTurnAngle = (this.steering / 1.5) * this.maxWheelTurn;
      this.wheels.forEach(wheelGroup => {
        // Reset wheel rotation
        wheelGroup.rotation.y = wheelTurnAngle;
        // Rotate the wheel mesh inside the group for forward motion
        wheelGroup.children[0].rotation.x = this.wheelRotation;
      });
      
      // Update back wheels (only forward rotation, no turning)
      this.backWheels.forEach(wheelGroup => {
        wheelGroup.children[0].rotation.x = this.wheelRotation;
      });

      // Convert m/s to km/h for speed display (multiply by 3.6)
      this.speedKMH = Math.abs(this.acceleration * 3.6);

      // Update collision box position
      this.updateCollisionBox();
    }
    this.updateNameTagPosition();
  }

  updateCollisionBox() {
    this.collisionBox.setFromObject(this.mesh);
  }

  checkCollision(otherCar) {
    return this.collisionBox.intersectsBox(otherCar.collisionBox);
  }

  handleCollision() {
    // Reverse acceleration and add a bounce effect
    this.acceleration = -this.acceleration * 0.5;
  }

  updateFromNetwork(position, rotation, speed) {
    this.mesh.position.lerp(position, 0.2);
    this.mesh.rotation.y = rotation.y;
    this.acceleration = speed;
    this.updateNameTagPosition();
  }

  remove() {
    this.scene.remove(this.mesh);
    if (this.nameTag) {
      this.scene.remove(this.nameTag);
    }
  }
}