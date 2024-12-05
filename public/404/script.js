const numStars = 30;
const minDistance = 15;  // Minimum distance between points (in pixels)
const numLights = 2000;
var t = 0;
const canvas = document.getElementById("light-canvas");
const ctx = canvas.getContext("2d");
var lights = [];
canvas.width = window.innerWidth;
canvas.height = window.innerWidth;
function getBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}
function approachRadially(current, target, rate) {
  // Exponentially move current towards target based on the rate
  return current + (target - current) * rate;
}

function generateEvenlyDistributedPoints(width, height, numPoints) {
  const points = [];

  // Calculate the number of rows and columns we need
  const cols = Math.floor(Math.sqrt(numPoints));
  const rows = Math.ceil(numPoints / cols);

  // Calculate the width and height of each grid cell
  const gridSizeX = Math.floor(width / cols);
  const gridSizeY = Math.floor(height / rows);

  // Function to check the distance between two points
  function isFarEnough(x, y) {
    for (let i = 0; i < points.length; i++) {
      const dist = Math.sqrt(Math.pow(x - points[i].x, 2) + Math.pow(y - points[i].y, 2));
      if (dist < minDistance) {
        return false;
      }
    }
    return true;
  }

  // Place points with distance check
  for (let i = 0; i < numPoints; i++) {
    let x, y;

    // Try to find a valid position that satisfies the minimum distance
    let validPosition = false;
    while (!validPosition) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      // Place points randomly within each grid cell
      x = Math.floor(col * gridSizeX + Math.random() * gridSizeX);
      y = Math.floor(row * gridSizeY + Math.random() * gridSizeY);

      // Ensure the point is far enough from other points
      if (isFarEnough(x, y)) {
        validPosition = true;
      }
    }

    points.push({ x, y });
  }

  return points;
}

function generateSinePeakDistributedPoints(width, height, numPoints) {
  const points = [];

  // Function to get a sine-weighted y position
  function getSineWeightedY() {
    // Generate a random value between 0 and 1 to simulate an evenly distributed point
    const rand = Math.random();

    // Map the random value to a sine-weighted distribution.
    // The sine function peaks at the top and bottom, and is lowest in the middle.
    const sineValue = Math.sin(Math.PI * rand - Math.PI / 2); // sine function from -1 to 1

    // Map the sine value to a vertical position (y) in the range [0, height]
    const y = Math.floor((sineValue + 1) / 2 * height); // Normalize sine value to positive and map to height
    return y;
  }

  // Calculate the number of rows and columns we need
  const cols = Math.floor(Math.sqrt(numPoints));
  const rows = Math.ceil(numPoints / cols);

  // Calculate the width and height of each grid cell
  const gridSizeX = Math.floor(width / cols);
  const gridSizeY = Math.floor(height / rows);

  // Place points based on sine distribution
  for (let i = 0; i < numPoints; i++) {
    let x, y;

    // Try to find a valid position that satisfies the sine distribution
    const row = Math.floor(i / cols);
    const col = i % cols;

    // Place points randomly within each grid cell
    x = Math.floor(col * gridSizeX + Math.random() * gridSizeX);
    y = getSineWeightedY(); // Use the sine-weighted y position

    points.push({ x, y });
  }

  return points;
}

function generateRoundDistributedPoints(width, height, numPoints) {
  const linearPoints = generateEvenlyDistributedPoints(width, height, numPoints);
  const newPoints = [];
  linearPoints.forEach(point => {
    const x = point.x;
    const y = getBaseLog(4, point.y) * canvas.height / 6.2;
    newPoints.push({ x, y });
  });
  console.log(newPoints);
  return newPoints;
}


function changeCSSVariable(element, variable, value) {
  element.style.setProperty(variable, value);
}



class Light {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw(t) {
    /*const pos = mapPointToEllipsoidProjection(this.x, this.y + t, canvas.width, canvas.height);
    if (!pos) {
      // Skip drawing if the point is outside the ellipsoid
      return;
    }
    const x = pos[0];
    const y = pos[1];*/
    let offset = ((t * Math.sqrt(this.y * 500) / 160) % canvas.width);
    let offsetY = canvas.height * 0.1
    ctx.beginPath();
    ctx.arc(this.x + offset, this.y + offsetY, 2, 0, 2 * Math.PI); // Use transformed coordinates
    ctx.fillStyle = "yellow";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(this.x + offset - canvas.width, this.y + offsetY, 2, 0, 2 * Math.PI); // Use transformed coordinates
    ctx.fillStyle = "yellow";
    ctx.fill();
  }
}


function initLights() {
  const points = generateRoundDistributedPoints(canvas.width, canvas.height, numLights);
  lights = points.map(point => new Light(point.x, point.y));
  requestAnimationFrame(animate);
}
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lights.forEach(light => {
    light.draw(t);
  });
  t += 0.4
  requestAnimationFrame(animate);
}

document.addEventListener("DOMContentLoaded", (e) => {
  setTimeout(() => {
    document.getElementById("home-button").classList.add("home-button-fly-in");
    document.getElementById("error-code").classList.add("error-code-fly-in");
  }, 300);

  const starContainer = document.getElementById("star-container");
  const containerWidth = starContainer.offsetWidth;
  const containerHeight = starContainer.offsetHeight;

  const positions = generateEvenlyDistributedPoints(containerWidth, containerHeight, numStars);

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("img");
    star.setAttribute("src", "/images/star.svg");
    star.classList.add("star");
    star.style.position = "absolute";
    star.style.left = `${positions[i].x}px`;
    star.style.top = `${positions[i].y}px`;
    changeCSSVariable(star, "--size", Math.random() * 0.5 + 0.2);
    changeCSSVariable(star, "--rotation", `${Math.floor(Math.random() * 20) - 10}deg`);
    changeCSSVariable(star, "--speed", `${Math.random() * 1 + 1}s`);
    changeCSSVariable(star, "--delay", `${Math.random() * 1}s`);
    changeCSSVariable(star, "--opacity", `${Math.random() * 0.1 + 0.1}`)
    starContainer.appendChild(star);
  }
  //l;oinitLights();
});