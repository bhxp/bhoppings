"use strict";
// Canvas Animation Framework
class CanvasAnimationFramework {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.resizeCanvas();
        this.lastFrameTime = performance.now();
        this.deltaTime = 0; // Time since last frame in seconds
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdateTime = performance.now();
        this.currentEffect = null;
        this.speedCoefficient = 50.0; // Default speed coefficient (1.0 = normal speed)
        // Set up event listeners
        window.addEventListener("resize", this.resizeCanvas.bind(this));
    }

    // Set the simulation speed
    setSpeed(coefficient) {
        this.speedCoefficient = coefficient;
    }

    // Get the current simulation speed
    getSpeed() {
        return this.speedCoefficient;
    }

    // Setup canvas dimensions
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // If we have an active effect, notify it of resize
        if (
            this.currentEffect &&
            typeof this.currentEffect.onResize === "function"
        ) {
            this.currentEffect.onResize(this.canvas.width, this.canvas.height);
        }
    }
    // Set the active effect
    setEffect(effect) {
        // Clean up previous effect if it has a dispose method
        if (
            this.currentEffect &&
            typeof this.currentEffect.dispose === "function"
        ) {
            this.currentEffect.dispose();
        }
        this.currentEffect = effect;
        // Initialize the effect with current canvas dimensions
        if (typeof this.currentEffect.init === "function") {
            this.currentEffect.init(
                this.canvas.width,
                this.canvas.height,
                this.ctx,
            );
        }
        // Start animation loop if not already running
        if (!this.isAnimating) {
            this.startAnimationLoop();
        }
    }
    // Calculate and update FPS
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFpsUpdateTime;
        // Update FPS approximately once per second
        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsUpdateTime = currentTime;
            // Notify effect of current FPS (just for information, not for timing)
            if (
                this.currentEffect &&
                typeof this.currentEffect.onFpsUpdate === "function"
            ) {
                this.currentEffect.onFpsUpdate(this.fps);
            }
        }
    }
    // Main animation loop
    startAnimationLoop() {
        this.isAnimating = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }
    animate(currentTime) {
        // Calculate delta time in seconds
        currentTime = currentTime || performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = currentTime;
        // Prevent extremely large delta times (e.g., when tab is inactive)
        if (this.deltaTime > 0.1) this.deltaTime = 0.016; // Cap at roughly 60fps equivalent

        // Apply speed coefficient to delta time
        const adjustedDeltaTime = this.deltaTime * this.speedCoefficient;

        // Update FPS counter
        this.updateFPS();
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // If we have an active effect, update and draw it
        if (
            this.currentEffect &&
            typeof this.currentEffect.update === "function"
        ) {
            this.currentEffect.update(adjustedDeltaTime);
        }
        if (
            this.currentEffect &&
            typeof this.currentEffect.draw === "function"
        ) {
            this.currentEffect.draw(this.ctx);
        }
        // Continue animation loop
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Wave Points Effect (Your original effect)
class WavePointsEffect {
    constructor(options = {}) {
        // Default options
        this.options = Object.assign(
            {
                numWaves: 20,
                rows: 80,
                gravityStrength: 10,
                waveSpeed: 0.000001,
            },
            options,
        );

        this.points = [];
        this.wavePoints = [];
        this.refreshRate = 60;
        this.fpsCompensation = 60;
    }

    init(width, height, ctx) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;

        // Calculate scales
        this.recalculateScales();

        // Generate grid points
        this.generatePoints();

        // Generate wave points
        this.generateWavePoints();
    }

    recalculateScales() {
        // Calculate scales to maintain even spacing
        this.xScale =
            Math.sqrt(this.width ** 2 + this.height ** 2) / this.options.rows;
        if (this.height >= this.width) {
            this.xScale *= 3;
        }
        this.yScale = this.xScale; // Keep square grid

        // Calculate number of rows and columns needed
        this.rows = Math.ceil((this.width * 1.2) / this.xScale);
        this.columns = Math.ceil((this.height * 1.2) / this.yScale);
    }

    generatePoints() {
        this.points = [];

        // Start position at -10% of canvas
        const startX = -0.1 * this.width;
        const startY = -0.1 * this.height;

        for (let y = 0; y < this.columns; y++) {
            for (let x = 0; x < this.rows; x++) {
                this.points.push({
                    x: startX + x * this.xScale,
                    y: startY + y * this.yScale,
                    originalX: startX + x * this.xScale,
                    originalY: startY + y * this.yScale,
                });
            }
        }
    }

    generateWavePoints() {
        this.wavePoints = [];

        // Initialize wave points with different phases and frequencies
        for (let i = 0; i < this.options.numWaves; i++) {
            this.wavePoints.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                amplitude: Math.random() * 20 + 5,
                frequency: Math.random() * 0.4 + 0.8, // Random frequency multiplier
                phase: Math.random() * Math.PI * 2, // Random initial phase offset
                wave: Math.random() * Math.PI * 2, // Start at random position in the cycle
            });
        }
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;
        this.recalculateScales();
        this.generatePoints();
        this.generateWavePoints();
    }

    onRefreshRateUpdate(refreshRate) {
        this.refreshRate = refreshRate;
        this.options.waveSpeed = 5e-5 / refreshRate;
    }

    onFpsUpdate(fps, compensation) {
        this.fpsCompensation = compensation;
    }

    update(fpsCompensation) {
        // Reset points to their original positions
        this.points.forEach((point) => {
            point.y = point.originalY; // Reset to original Y position
            point.x = point.originalX;
        });

        // Apply gravity towards wave points
        this.points.forEach((point) => {
            // Find the nearest wave point
            this.wavePoints.forEach((wave) => {
                // Increment each wave's position based on its unique frequency
                wave.wave +=
                    this.options.waveSpeed * wave.frequency * fpsCompensation;

                const dx = wave.x - point.x; // Change in x
                const dy = wave.y - point.y; // Change in y

                // Normalize the direction vector to ensure consistent speed
                const distanceToWave = Math.hypot(dx, dy);
                if (distanceToWave > 0) {
                    // Calculate normalized direction
                    const normX = dx / distanceToWave;
                    const normY = dy / distanceToWave;

                    // Use the wave's unique phase in the sin calculation
                    point.x +=
                        normX *
                        this.options.gravityStrength *
                        Math.sin(wave.wave + wave.phase) *
                        -1;
                    point.y +=
                        normY *
                        this.options.gravityStrength *
                        Math.sin(wave.wave + wave.phase) *
                        -1;
                }
            });
        });
    }

    draw(ctx) {
        // Draw points
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        this.points.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });

        // Uncomment to see wave points
        /*
        ctx.fillStyle = 'red';
        this.wavePoints.forEach(wave => {
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });
        */
    }
}

// Example of a different effect: Particle Field
class ParticleFieldEffect {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                particleCount: 200,
                particleSpeed: 1,
                particleSize: 3,
                connectionDistance: 150,
                connectionOpacity: 0.5,
            },
            options,
        );

        this.particles = [];
    }

    init(width, height) {
        this.width = width;
        this.height = height;

        // Create particles
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * this.options.particleSpeed,
                vy: (Math.random() - 0.5) * this.options.particleSpeed,
                size: Math.random() * this.options.particleSize + 1,
            });
        }
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;

        // Adjust particles to new canvas size
        this.particles.forEach((particle) => {
            if (particle.x > width) particle.x = width;
            if (particle.y > height) particle.y = height;
        });
    }

    onRefreshRateUpdate() {
        // No specific action needed
    }

    onFpsUpdate(fps, compensation) {
        this.fpsCompensation = compensation;
    }

    update(fpsCompensation) {
        // Update particle positions
        this.particles.forEach((particle) => {
            // Move particles
            particle.x += particle.vx * fpsCompensation;
            particle.y += particle.vy * fpsCompensation;

            // Wrap around edges
            if (particle.x < 0) particle.x = this.width;
            if (particle.x > this.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.height;
            if (particle.y > this.height) particle.y = 0;
        });
    }

    draw(ctx) {
        // Draw connections first (lines between nearby particles)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 0.5;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.options.connectionDistance) {
                    // Draw a line with opacity based on distance
                    const opacity =
                        (1 - distance / this.options.connectionDistance) *
                        this.options.connectionOpacity;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;

                    ctx.beginPath();
                    ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw particles
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        this.particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Example of another effect: Flowing Lines
class FlowingLinesEffect {
    constructor(options = {}) {
        this.options = Object.assign(
            {
                lineCount: 100,
                lineLength: 50,
                lineWidth: 2,
                flowSpeed: 0.002,
                noiseScale: 0.003,
            },
            options,
        );

        this.lines = [];
        this.time = 0;
    }

    init(width, height) {
        this.width = width;
        this.height = height;

        // Create flowing lines
        this.lines = [];
        for (let i = 0; i < this.options.lineCount; i++) {
            this.lines.push({
                x: Math.random() * width,
                y: Math.random() * height,
                angle: Math.random() * Math.PI * 2,
                length: Math.random() * this.options.lineLength + 20,
                width: Math.random() * this.options.lineWidth + 0.5,
                speed: Math.random() * 0.5 + 0.5, // Speed multiplier
            });
        }
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;

        // Adjust lines to new canvas size
        this.lines.forEach((line) => {
            if (line.x > width) line.x = width;
            if (line.y > height) line.y = height;
        });
    }

    onRefreshRateUpdate() {
        // No specific action needed
    }

    onFpsUpdate(fps, compensation) {
        this.fpsCompensation = compensation;
    }

    // Simplified noise function (you might want to use a proper Perlin noise implementation)
    noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        return (Math.sin(X * 12.9898 + Y * 78.233) * 43758.5453) % 1;
    }

    update(fpsCompensation) {
        this.time += this.options.flowSpeed * fpsCompensation;

        // Update lines
        this.lines.forEach((line) => {
            // Use noise to adjust angle
            const noiseX = this.noise(
                line.x * this.options.noiseScale,
                line.y * this.options.noiseScale + this.time,
            );
            const noiseY = this.noise(
                line.x * this.options.noiseScale + 100,
                line.y * this.options.noiseScale + this.time + 100,
            );

            line.angle = (noiseX + noiseY) * Math.PI * 2;

            // Move in the direction of the angle
            line.x += Math.cos(line.angle) * line.speed * fpsCompensation;
            line.y += Math.sin(line.angle) * line.speed * fpsCompensation;

            // Wrap around edges
            if (line.x < 0) line.x = this.width;
            if (line.x > this.width) line.x = 0;
            if (line.y < 0) line.y = this.height;
            if (line.y > this.height) line.y = 0;
        });
    }

    draw(ctx) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";

        this.lines.forEach((line) => {
            ctx.lineWidth = line.width;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(
                line.x + Math.cos(line.angle) * line.length,
                line.y + Math.sin(line.angle) * line.length,
            );
            ctx.stroke();
        });
    }
}

// Shooting Stars Effect
class ShootingStarsEffect {
    constructor(options = {}) {
        // Default options
        this.options = Object.assign(
            {
                starCount: 100, // Number of stars
                minSpeed: 3, // Minimum speed
                maxSpeed: 10, // Maximum speed
                minSize: 0.5, // Minimum star size
                maxSize: 3, // Maximum star size
                tailLength: 20, // Length of star tails
                angle: Math.PI / 6, // Angle of rain (default: 30 degrees)
                backgroundColor: "rgba(0, 0, 0, 0.1)", // Background color with trail effect
                starColor: "rgba(255, 255, 255, 0.8)", // Star color
                respawnBuffer: 100, // Distance above canvas for respawning
            },
            options,
        );

        this.stars = [];
        this.width = 0;
        this.height = 0;
    }

    init(width, height) {
        this.width = width;
        this.height = height;

        // Create stars
        this.stars = [];
        for (let i = 0; i < this.options.starCount; i++) {
            this.stars.push(this.createStar(true));
        }
    }

    createStar(randomizeY = false) {
        // Calculate direction vector based on angle
        const dirX = Math.sin(this.options.angle);
        const dirY = Math.cos(this.options.angle);

        // Randomize starting position
        // For stars to come from top, we position them above the canvas
        let x =
            Math.random() * (this.width + 2 * this.options.respawnBuffer) -
            this.options.respawnBuffer;
        let y;

        if (randomizeY) {
            // For initial population, distribute stars across the field
            y =
                Math.random() * (this.height + this.options.respawnBuffer) -
                this.options.respawnBuffer;
        } else {
            // For new stars, start them above the canvas
            y = -this.options.respawnBuffer;

            // Adjust x position based on star direction to create even distribution
            x += dirX * this.options.respawnBuffer;
        }

        return {
            x: x,
            y: y,
            size:
                Math.random() * (this.options.maxSize - this.options.minSize) +
                this.options.minSize,
            speed:
                Math.random() *
                    (this.options.maxSpeed - this.options.minSpeed) +
                this.options.minSpeed,
            // Store the direction vector for this star
            dirX: dirX,
            dirY: dirY,
            // To create twinkling effect
            brightness: Math.random() * 0.5 + 0.5,
            // Store previous positions for the tail
            trail: [],
        };
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;

        // Reset stars to fit the new canvas size
        this.stars = this.stars.map((star) => this.createStar(true));
    }

    onRefreshRateUpdate() {
        // No specific action needed
    }

    onFpsUpdate(fps, compensation) {
        this.fpsCompensation = compensation;
    }

    update(fpsCompensation) {
        // Apply semi-transparent background to create trail effect
        // This is now moved to the draw method

        // Update stars
        this.stars.forEach((star) => {
            // Update trail (store previous positions)
            star.trail.unshift({ x: star.x, y: star.y });
            // Limit trail length
            if (star.trail.length > this.options.tailLength) {
                star.trail.pop();
            }

            // Move star
            star.x += star.dirX * star.speed * fpsCompensation;
            star.y += star.dirY * star.speed * fpsCompensation;

            // Twinkle effect - slight variation in brightness
            star.brightness = Math.max(
                0.5,
                Math.min(1, star.brightness + (Math.random() - 0.5) * 0.1),
            );

            // If star has moved off screen, reset it
            if (
                star.y > this.height + star.size ||
                star.x < -this.options.respawnBuffer ||
                star.x > this.width + this.options.respawnBuffer
            ) {
                // Create a new star at the top
                const newStar = this.createStar();
                star.x = newStar.x;
                star.y = newStar.y;
                star.size = newStar.size;
                star.speed = newStar.speed;
                star.trail = []; // Clear the trail
            }
        });
    }

    draw(ctx) {
        // Apply semi-transparent background to create trail effect
        ctx.fillStyle = this.options.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars and their trails
        this.stars.forEach((star) => {
            // Draw trail
            if (star.trail.length > 1) {
                ctx.beginPath();
                const gradient = ctx.createLinearGradient(
                    star.x,
                    star.y,
                    star.trail[star.trail.length - 1].x,
                    star.trail[star.trail.length - 1].y,
                );

                gradient.addColorStop(
                    0,
                    `rgba(255, 255, 255, ${star.brightness * 0.2})`,
                );
                gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctx.strokeStyle = gradient;
                ctx.lineWidth = star.size;

                ctx.moveTo(star.x, star.y);
                for (let i = 0; i < star.trail.length; i++) {
                    ctx.lineTo(star.trail[i].x, star.trail[i].y);
                }
                ctx.stroke();
            }

            // Draw star (brighter point at the head)
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.2})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

class StarFieldEffect {
    constructor() {
        // Configuration
        this.STAR_COLOR = "rgba(255, 255, 255, 0.1)";
        this.STAR_SIZE = 3;
        this.STAR_MIN_SCALE = 1;
        this.OVERFLOW_THRESHOLD = 50;

        // State variables
        this.width = 0;
        this.height = 0;
        this.scale = 1;
        this.stars = [];
        this.pointerX = null;
        this.pointerY = null;
        this.velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };
        this.touchInput = false;

        // Canvas context
        this.ctx = null;
    }

    init(width, height, ctx) {
        this.width = width;
        this.height = height;
        this.ctx = ctx;
        this.scale = window.devicePixelRatio || 1;

        // Calculate star count based on screen dimensions
        const STAR_COUNT = (width + height) / 8;

        // Generate stars
        this.stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z:
                    this.STAR_MIN_SCALE +
                    Math.random() * (1 - this.STAR_MIN_SCALE),
            });
        }

        // Set up event listeners specific to this effect
        document.addEventListener("mousemove", this.onMouseMove.bind(this));
        document.addEventListener("touchmove", this.onTouchMove.bind(this), {
            passive: false,
        });
        document.addEventListener("touchend", this.onMouseLeave.bind(this));
        document.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    }

    // Framework callback when canvas is resized
    onResize(width, height) {
        this.width = width;
        this.height = height;
        this.stars.forEach((star) => this.placeStar(star));
    }

    // Framework callback for refresh rate updates
    onRefreshRateUpdate(refreshRate) {
        // Adjust animation speed based on refresh rate if needed
    }

    // Framework callback for FPS information
    onFpsUpdate(fps, fpsCompensation) {
        // Adjust animation based on actual FPS if needed
    }

    // Position a star randomly on the canvas
    placeStar(star) {
        star.x = Math.random() * this.width;
        star.y = Math.random() * this.height;
    }

    // Recycle stars that go out of bounds
    recycleStar(star) {
        let direction = "z";

        let vx = Math.abs(this.velocity.x),
            vy = Math.abs(this.velocity.y);

        if (vx > 1 || vy > 1) {
            let axis;

            if (vx > vy) {
                axis = Math.random() < vx / (vx + vy) ? "h" : "v";
            } else {
                axis = Math.random() < vy / (vx + vy) ? "v" : "h";
            }

            if (axis === "h") {
                direction = this.velocity.x > 0 ? "l" : "r";
            } else {
                direction = this.velocity.y > 0 ? "t" : "b";
            }
        }

        star.z =
            this.STAR_MIN_SCALE + Math.random() * (1 - this.STAR_MIN_SCALE);

        if (direction === "z") {
            star.z = 0.1;
            star.x = Math.random() * this.width;
            star.y = Math.random() * this.height;
        } else if (direction === "l") {
            star.x = -this.OVERFLOW_THRESHOLD;
            star.y = this.height * Math.random();
        } else if (direction === "r") {
            star.x = this.width + this.OVERFLOW_THRESHOLD;
            star.y = this.height * Math.random();
        } else if (direction === "t") {
            star.x = this.width * Math.random();
            star.y = -this.OVERFLOW_THRESHOLD;
        } else if (direction === "b") {
            star.x = this.width * Math.random();
            star.y = this.height + this.OVERFLOW_THRESHOLD;
        }
    }

    // Event handler for mouse movement
    onMouseMove(event) {
        this.touchInput = false;
        this.movePointer(event.clientX, event.clientY);
    }

    // Event handler for touch movement
    onTouchMove(event) {
        this.touchInput = true;
        this.movePointer(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
    }

    // Event handler for mouse/touch end
    onMouseLeave() {
        this.pointerX = null;
        this.pointerY = null;
    }

    // Update pointer position and calculate velocity
    movePointer(x, y) {
        if (
            typeof this.pointerX === "number" &&
            typeof this.pointerY === "number"
        ) {
            let ox = x - this.pointerX,
                oy = y - this.pointerY;

            this.velocity.tx =
                this.velocity.tx +
                (ox / 8) * this.scale * (this.touchInput ? 1 : -1);
            this.velocity.ty =
                this.velocity.ty +
                (oy / 8) * this.scale * (this.touchInput ? 1 : -1);
        }

        this.pointerX = x;
        this.pointerY = y;
    }

    // Framework callback for updating animation state (called every frame)
    update(fpsCompensation) {
        // Apply velocity damping
        this.velocity.tx *= 0.94;
        this.velocity.ty *= 0.94;

        // Apply easing to velocity
        this.velocity.x += (this.velocity.tx - this.velocity.x) * 0.7;
        this.velocity.y += (this.velocity.ty - this.velocity.y) * 0.7;

        // Update each star
        this.stars.forEach((star) => {
            star.x += this.velocity.x * star.z * 0.1;
            star.y += this.velocity.y * star.z * 0.1;

            star.x += (star.x - this.width / 2) * this.velocity.z * star.z;
            star.y += (star.y - this.height / 2) * this.velocity.z * star.z;
            star.z += this.velocity.z;

            // Recycle when out of bounds
            if (
                star.x < -this.OVERFLOW_THRESHOLD ||
                star.x > this.width + this.OVERFLOW_THRESHOLD ||
                star.y < -this.OVERFLOW_THRESHOLD ||
                star.y > this.height + this.OVERFLOW_THRESHOLD
            ) {
                this.recycleStar(star);
            }
        });
    }

    // Framework callback for rendering (called every frame)
    draw(ctx) {
        this.stars.forEach((star) => {
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineWidth = this.STAR_SIZE * star.z * this.scale;
            ctx.strokeStyle = this.STAR_COLOR;

            ctx.beginPath();
            ctx.moveTo(star.x, star.y);

            let tailX = this.velocity.x * 0.1,
                tailY = this.velocity.y * 0.1;

            // stroke() won't work on an invisible line
            if (Math.abs(tailX) < 0.1) tailX = 0.5;
            if (Math.abs(tailY) < 0.1) tailY = 0.5;

            ctx.lineTo(star.x + tailX, star.y + tailY);
            ctx.stroke();
        });
    }

    // Clean up method when effect is removed (optional)
    dispose() {
        // Remove event listeners to prevent memory leaks
        document.removeEventListener("mousemove", this.onMouseMove);
        document.removeEventListener("touchmove", this.onTouchMove);
        document.removeEventListener("touchend", this.onMouseLeave);
        document.removeEventListener("mouseleave", this.onMouseLeave);
    }
}

const animationFramework = new CanvasAnimationFramework("waveCanvas");
document.addEventListener("DOMContentLoaded", () => {
    const effect = JSON.parse(localStorage.getItem("effect")) || 0;
    if (!localStorage.getItem("effect")) {
        localStorage.setItem("effect", JSON.stringify(effect));
    }
    //WavePointsEffect ParticleFieldEffect FlowingLinesEffect ShootingStarsEffect StarFieldEffect
    const effects = {
        waves: WavePointsEffect,
        particle_field: ParticleFieldEffect,
        flowing_lines: FlowingLinesEffect,
        shooting_stars: ShootingStarsEffect,
        starfield: StarFieldEffect,
    };

    const effectInstance = new effects[Object.keys(effects)[effect]]();

    // Use the framework to run the effect
    animationFramework.setEffect(effectInstance);
});
