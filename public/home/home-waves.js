"use strict";

// based on chatgpts code that didnt work; about half is mine

const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lastTime = 0;
let refreshRate = 0;

function detectRefreshRate() {
    const currentTime = performance.now();
    const timeDifference = currentTime - lastTime;

    if (timeDifference > 0) {
        refreshRate = 1000 / timeDifference; // In Hz (frames per second)
    }

    lastTime = currentTime;
    waveSpeed = 5e-5 / refreshRate;

    requestAnimationFrame(detectRefreshRate); // Keep running the function
}

const ogSize = [canvas.width, canvas.height];

var points = [];
var wavePoints = [];
var numWaves = 20; // Number of wave points
var rows = 80;
var xScale = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / rows;
var columns = Math.round(canvas.height / xScale);
var yScale = xScale; //canvas.height / columns * 1.5;
var fpsCompensation = 1;
var fps = 0;
var countingFps = true;
var gravityStrength = 10; // Strength of the pull towards wave points
var waveSpeed = 0.000001;
var cols = Math.ceil(Math.sqrt(numPoints)); // Calculate number of columns

requestAnimationFrame(detectRefreshRate);

function generatePoints() {
    // Calculate number of points needed to cover canvas plus overflow
    const totalWidth = canvas.width * 1.2; // Add 20% for overflow (-10% to 110%)
    const totalHeight = canvas.height * 1.2;

    // Calculate scales to maintain even spacing
    xScale = Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / rows; // Adjust this number to control density
    if (canvas.height >= canvas.width) {
        xScale *= 3;
    }
    yScale = xScale; // Keep square grid

    // Calculate number of rows and columns needed
    rows = Math.ceil(totalWidth / xScale);
    columns = Math.ceil(totalHeight / yScale);

    points = [];

    // Start position at -10% of canvas
    const startX = -0.1 * canvas.width;
    const startY = -0.1 * canvas.height;

    for (let y = 0; y < columns; y++) {
        for (let x = 0; x < rows; x++) {
            points.push({
                x: startX + x * xScale,
                y: startY + y * yScale,
                originalX: startX + x * xScale,
                originalY: startY + y * yScale,
            });
        }
    }
}

$(window).on("resize", function (e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generatePoints();
});

function fpsIncrement() {
    fps++;
    if (countingFps) {
        requestAnimationFrame(fpsIncrement);
    }
}

setTimeout(5000, () => {
    requestAnimationFrame(fpsIncrement);
    setTimeout(2000, () => {
        countingFps = false;
        fps /= 2;
        fpsCompensation = 60 / fps;
    });
});

function distributePoints(numPoints, width, height) {
    const spacingX = width / cols; // Calculate horizontal spacing
    const spacingY = height / rows; // Calculate vertical spacing

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (points.length < numPoints) {
                // Check if we've added enough points
                const x = col * spacingX + spacingX / 2; // Center the point in the cell
                const y = row * spacingY + spacingY / 2; // Center the point in the cell
                points.push({ x, y });
            }
        }
    }
    return points;
}

// Example usage:
var numPoints = 10; // Number of points to distribute
var width = 800; // Width of the area
var height = 400; // Height of the area

const distributedPoints = distributePoints(numPoints, width, height);
console.log(distributedPoints);

const pointPositions = distributePoints(numWaves, canvas.width, canvas.height);

// Initialize wave points randomly across the canvas
for (let i = 0; i < numWaves; i++) {
    wavePoints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        amplitude: Math.random() * 20 + 5,
        wave: Math.random() * 40 + 10,
    });
}

generatePoints();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset points to their original positions
    points.forEach((point) => {
        point.y = point.originalY; // Reset to original Y position
        point.x = point.originalX;
    });

    // Apply gravity towards wave points
    points.forEach((point) => {
        // Find the nearest wave point
        wavePoints.forEach((wave) => {
            const distance = Math.hypot(wave.x - point.x, wave.y - point.y);
            wave.wave += waveSpeed * fpsCompensation;

            // Calculate the pull towards the nearest wave point
            const dx = wave.x - point.x; // Change in x
            const dy = wave.y - point.y; // Change in y

            // Normalize the direction vector to ensure consistent speed
            const distanceToWave = Math.hypot(dx, dy);
            if (distanceToWave > 0) {
                // Calculate normalized direction
                const normX = dx / distanceToWave;
                const normY = dy / distanceToWave;

                // Move the point towards the wave point based on gravity
                point.x += normX * gravityStrength * Math.sin(wave.wave) * -1;
                point.y += normY * gravityStrength * Math.sin(wave.wave) * -1;
            }
        });
    });

    /*
    // Draw wave points
    ctx.fillStyle = 'red';
    wavePoints.forEach(wave => {
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, 8, 0, Math.PI * 2);
        ctx.fill();
    });

    */

    // Draw points
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw); // Loop the drawing
}

draw(); // Start the animation
