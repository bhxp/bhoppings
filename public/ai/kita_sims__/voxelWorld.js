import * as THREE from 'three';
import { coordinateSystem } from './coordinateSystem.js';

export class VoxelWorld {
  constructor(world) {
    this.world = world;
    this.group = new THREE.Group();
    this.voxelSize = 1.0;
    this.voxels = new Map();
    this.layerLabels = {};
    this.materials = {
      ground: new THREE.MeshLambertMaterial({ 
        color: 0x90EE90,
        transparent: true,
        opacity: 0.6
      }),
      floor: new THREE.MeshLambertMaterial({ 
        color: 0xE6D5AC,
        transparent: true,
        opacity: 0.7 
      }),
      wall: new THREE.MeshLambertMaterial({ 
        color: 0xF5F5F5,
        transparent: true,
        opacity: 0.5 
      }),
      ceiling: new THREE.MeshLambertMaterial({ 
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.4
      }),
      window: new THREE.MeshLambertMaterial({ 
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.3,
        shininess: 100
      })
    };
    this.geometry = new THREE.BoxGeometry(
      this.voxelSize, 
      this.voxelSize, 
      this.voxelSize
    );
  }

  setVoxel(x, y, z, type) {
    const key = `${x},${y},${z}`;
    if (this.voxels.has(key)) {
      const existingVoxel = this.voxels.get(key);
      this.group.remove(existingVoxel);
    }
    if (type === 0) {
      this.voxels.delete(key);
      return;
    }
    let mesh;
    // Special case: for level 1 (y===0) and type 1, create a 1-pixel (very thin) red layer.
    if (type === 1 && y === 0) {
      const thinHeight = 0.05; // Adjust this value to approximate a 1-pixel thick layer
      const geometry = new THREE.BoxGeometry(this.voxelSize, thinHeight, this.voxelSize);
      const material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      mesh = new THREE.Mesh(geometry, material);
      // Position so that the bottom sits exactly at y = 0
      mesh.position.set(x * this.voxelSize, thinHeight / 2, z * this.voxelSize);
    } else {
      const material = this.getMaterialForType(type);
      mesh = new THREE.Mesh(this.geometry, material);
      if (type === 3) {
        mesh.material.transparent = true;
        mesh.material.opacity = 0.55;
      }
      mesh.position.set(x * this.voxelSize, y * this.voxelSize, z * this.voxelSize);
    }
    this.group.add(mesh);
    this.voxels.set(key, mesh);
    // Register this voxel in the coordinate system:
    coordinateSystem.register('voxel', key, { x, y, z });
  }

  getMaterialForType(type) {
    switch(type) {
      case 1: return this.materials.ground;
      case 2: return this.materials.floor;
      case 3: return this.materials.wall;
      case 4: return this.materials.ceiling;
      case 5: return this.materials.window;
      default: return this.materials.wall;
    }
  }

  getVoxel(x, y, z) {
    return this.voxels.get(`${x},${y},${z}`);
  }

  raycast(raycaster) {
    const intersects = raycaster.intersectObjects(this.group.children);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const position = intersect.point.sub(intersect.face.normal.multiplyScalar(0.5));
      return {
        position: [
          Math.floor(position.x / this.voxelSize),
          Math.floor(position.y / this.voxelSize),
          Math.floor(position.z / this.voxelSize)
        ],
        normal: intersect.face.normal,
        voxel: intersect.object
      };
    }
    return null;
  }

  createLabelSprite(layerNum) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 40px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(layerNum.toString(), canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 1, 1);
    return sprite;
  }

  updateLayerLabels() {
    const layers = {};
    this.voxels.forEach((mesh, key) => {
      const parts = key.split(',');
      const x = parseFloat(parts[0]);
      const y = parseFloat(parts[1]);
      const z = parseFloat(parts[2]);
      if (!(y in layers)) {
        layers[y] = { minX: x, minZ: z };
      } else {
        layers[y].minX = Math.min(layers[y].minX, x);
        layers[y].minZ = Math.min(layers[y].minZ, z);
      }
    });
    const sortedYs = Object.keys(layers)
      .map(Number)
      .sort((a, b) => a - b);
    sortedYs.forEach((y, index) => {
      const layerNum = index + 1;
      if (!this.layerLabels[y]) {
        const labelSprite = this.createLabelSprite(layerNum);
        labelSprite.position.set(
          layers[y].minX * this.voxelSize - 0.5,
          y * this.voxelSize,
          layers[y].minZ * this.voxelSize - 0.5
        );
        this.group.add(labelSprite);
        this.layerLabels[y] = labelSprite;
      }
    });
  }
}