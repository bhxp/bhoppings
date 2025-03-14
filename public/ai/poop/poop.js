const { Engine, Render, Runner, Bodies, Composite, MouseConstraint, Mouse, World } = Matter;

// Define a fixed time step in milliseconds (60 updates per second)
const fixedTimeStep = 1000 / 60;

// Create the engine and world
const engine = Engine.create();
const world = engine.world;
var poopScale = 0.1;
var mousePos = { x: 0, y: 0 };

// Canvas dimensions
const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

const render = Render.create({
    element: document.body,
    canvas: document.getElementById('world'),
    engine: engine,
    options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'rgba(0, 0, 0, 0)'
    }
});

Render.run(render);

// Custom runner using a fixed time step
function runSimulation() {
    // Update the engine with the fixed time step
    Engine.update(engine, fixedTimeStep);

    // Request the next frame, maintaining a fixed simulation speed regardless of refresh rate
    requestAnimationFrame(runSimulation);
}

// Start the custom simulation runner
runSimulation();

// Add boundaries to prevent emojis from falling out of the canvas
const boundaries = [
    Bodies.rectangle(canvasWidth / 2, canvasHeight + 20, canvasWidth, 40, { isStatic: true }), // floor
    Bodies.rectangle(canvasWidth / 2, -20, canvasWidth, 40, { isStatic: true }), // ceiling (top collision)
    Bodies.rectangle(-20, canvasHeight / 2, 40, canvasHeight, { isStatic: true }), // left wall
    Bodies.rectangle(canvasWidth + 20, canvasHeight / 2, 40, canvasHeight, { isStatic: true }) // right wall
];
Composite.add(world, boundaries);

// Function to create poop emoji shapes using an equilateral triangle body
function createPoopEmoji(x, y) {
    const scale = poopScale + (Math.random() / 20);
    const size = scale * 625; // Size of the triangle
    let texture = poopFile;
    if (skin == 20) {
        texture = `/images/poop/${Math.floor(Math.random() * 20)}.svg`;
    }
    const poop = Bodies.polygon(x, y, 3, size, {
        render: {
            sprite: {
                texture: texture,
                xScale: scale,
                yScale: scale
            }
        }
    });

    // Add a history array to keep track of previous positions
    poop.history = [];
    poop.historyLength = 5; // Number of previous positions to store for motion blur

    return poop;
}






// Add mouse control
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});
Composite.add(world, mouseConstraint);

// Resize canvas on window resize
window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});

// Track mouse position
document.addEventListener("mousemove", (e) => {
    mousePos = { x: e.clientX, y: e.clientY };
});

// Create a new poop emoji at the cursor position when the spacebar is pressed
document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        const poop = createPoopEmoji(mousePos.x + Math.random() * 20, mousePos.y + Math.random() * 20);
        Composite.add(world, poop);
    }
});

Matter.Events.on(engine, 'beforeRender', () => {
    const ctx = render.context;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    Composite.allBodies(world).forEach(poop => {
        if (poop.speed > 0.2) { // Only redraw moving poops
            // Store the current position for motion blur
            poop.history.push({ x: poop.position.x, y: poop.position.y });
            if (poop.history.length > poop.historyLength) poop.history.shift();

            // Motion blur effect with fading
            const alphaStep = 1 / poop.historyLength;
            poop.history.forEach((pos, index) => {
                const alpha = 1 - alphaStep * index;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.drawImage(render.context.canvas, pos.x - 25, pos.y - 25, 50, 50);
                ctx.restore();
            });
            ctx.drawImage(render.context.canvas, poop.position.x - 25, poop.position.y - 25, 50, 50);
        }
    });
});


function abbreviateNumber(num) {
    if (num < 1000) {
        return num.toString();
    }

    const abbrevs = [
        { limit: 1_000_000_000, suffix: 'B' },
        { limit: 1_000_000, suffix: 'M' },
        { limit: 1_000, suffix: 'K' }
    ];

    for (const { limit, suffix } of abbrevs) {
        if (num >= limit) {
            return (num / limit).toFixed(1) + suffix;
        }
    }
}

var localStorage = window.localStorage;
var money = JSON.parse(localStorage.getItem('money')) || 0;
var skin = JSON.parse(localStorage.getItem('skin')) || 0;
var experience = JSON.parse(localStorage.getItem('experience')) || 0;
var unlocked = JSON.parse(localStorage.getItem('unlocked')) || 1;
const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
if (!JSON.parse(localStorage.getItem('money'))) {
    localStorage.setItem("money", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('experience'))) {
    localStorage.setItem("experience", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('skin'))) {
    localStorage.setItem("skin", JSON.stringify(0));
}
if (!JSON.parse(localStorage.getItem('unlocked'))) {
    localStorage.setItem("unlocked", JSON.stringify(1));
}

var poopFile;
if (skin < 20) {
    poopFile = `/images/poop/${skin}.svg`;
} else {
    poopFile = "/images/poop/invalid.svg";
}
$(".item").eq(0).on("click", (e) => {
    window.open('battlepass', '_self');
    return e;
});



function updateMoney() {
    localStorage.setItem("money", JSON.stringify(Math.floor(money)));
    localStorage.setItem("experience", JSON.stringify(Math.floor(experience)));

    return JSON.parse(localStorage.getItem("money"));
}

function addMoney(amount) {
    money += amount;
    experience += amount;
    updateMoney();
    return money;
}

function getXpFromLevel(level) {
    const baseXp = 700;  // Base XP required for level 1 to 2
    const multiplier = 1.4;  // Exponential multiplier per level

    // If level is 0 or less, return 0 XP (since level 0 corresponds to 0 XP)
    if (level <= 0) {
        return 0;
    }

    // Calculate XP using the formula: XP = baseXp * (multiplier ^ (level - 1))
    const xp = baseXp * Math.pow(multiplier, level - 1);

    return xp;
}


function getLevelFromXp(xp) {
    const baseXp = 700;  // Base XP required for level 1 to 2
    const multiplier = 1.4;  // Exponential multiplier per level

    // If XP is less than or equal to 0, return level 0
    if (xp <= 0) {
        return 0;
    }

    // Calculate the level based on XP, but ensure it doesn't go below level 1
    const level = Math.floor(Math.log(xp / baseXp) / Math.log(multiplier)) + 1;

    return Math.max(0, level);
}

function getCurrentLevelXp(xp) {
    const currentLevel = getLevelFromXp(xp);
    const minXpForCurrentLevel = getXpFromLevel(currentLevel);

    // The amount of experience within the current level is the difference
    const currentLevelXp = xp - minXpForCurrentLevel;

    return currentLevelXp;
}




function displayMoney() {
    ctx.font = '30px "Instrument Sans"';
    ctx.fillStyle = '#694d0c';
    $("#ui .item").eq(1).find("span").text(abbreviateNumber(Math.floor(money)));
    $("#ui .item").eq(0).find("span").text(getLevelFromXp(experience));

    requestAnimationFrame(displayMoney);
}
requestAnimationFrame(displayMoney);

var rewards = {
    collision: 0.5,
    floating: 0.1
}

// Store all bodies that are colliding
let collidingBodies = new Set();

// Listen for collision start event
Matter.Events.on(engine, 'collisionStart', function(event) {
    // For each pair of bodies that are colliding
    event.pairs.forEach(pair => {
        collidingBodies.add(pair.bodyA);
        collidingBodies.add(pair.bodyB);
    });
});

// Listen for collision end event
Matter.Events.on(engine, 'collisionEnd', function(event) {
    // For each pair of bodies that stopped colliding
    event.pairs.forEach(pair => {
        collidingBodies.delete(pair.bodyA);
        collidingBodies.delete(pair.bodyB);
    });
});

function getNonCollidingBodies() {
    // Get all bodies in the world
    const allBodies = Matter.Composite.allBodies(world);

    // Filter out bodies that are in the collidingBodies set
    const nonCollidingBodies = allBodies.filter(body => !collidingBodies.has(body));

    return nonCollidingBodies;
}

// Listen for collision start event
Matter.Events.on(engine, 'collisionStart', function(event) {
    // The event contains the pairs of bodies that are colliding
    const pairs = event.pairs;

    if (Math.random() > 0.7) {
        addMoney(rewards.collision);
    }

});

setInterval(() => {
    const nonCollidingBodies = getNonCollidingBodies();
    nonCollidingBodies.forEach((body) => {
        if (Math.random() > 0.3) {
            addMoney(rewards.floating);
        }
    })
}, 500)

function resetMoney() {
    money = 0;
    updateMoney();
}

function deletePoops() {
    Composite.clear(world, true);
    Matter.World.add(world, mouseConstraint);

    // Reattach the mouse to the engine (if necessary)
    Matter.Engine.update(engine);
}

// Select all buttons on the page
const buttons = document.querySelectorAll('button');

// Attach the click event to each button
buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove focus after the button is clicked
        this.blur();
    });
});



// Add some poop emojis to the world
for (let i = 0; i < 10; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight / 2;
    const poop = createPoopEmoji(x, y);
    Composite.add(world, poop);
}

function setSkin() {
    const skin = document.getElementById("skin").value;
    localStorage.setItem("skin", JSON.stringify(skin));
    window.location.reload();
}

function wavePeaksOnlyAtX(x, amplitude, frequency) {
    // Calculate the sine wave point for the given x
    const y = Math.abs(amplitude * Math.sin(x * (Math.PI * 2) / frequency));

    // Return y if it's in the top half (positive values), otherwise return 0
    return y;
}

const surface = document.getElementById("waterSurface");
const context = surface.getContext("2d");

const width = surface.width;
const height = surface.height;
const halfHeight = height / 2;
let time = 0;

// Function to create the moving wave effect
function createWaterSurface() {
    // Example usage:
    const amplitude = 3;       // Peak height
    const frequency = 7;       // Number of cycles in a given period
    const numPoints = width * 2;     // Number of points in the wave

    const currentLevel = getLevelFromXp(experience);
    const nextLevel = currentLevel + 1;
    const thisLevelToNextLevel = getXpFromLevel(nextLevel) - getXpFromLevel(currentLevel);
    const currentLevelXp = experience - getXpFromLevel(currentLevel);
    const levelProgress = currentLevelXp / thisLevelToNextLevel;
    context.fillStyle = "#000000";
    context.clearRect(0, 0, width, height);
    //context.fillRect(0, height - (height * (1 - levelProgress)), width, y);
    context.beginPath()
    context.moveTo(width, 0)
    context.moveTo(0, 0)
    for (let x = 0; x < width; x++) {
        let y = height * (1 - (levelProgress)) + wavePeaksOnlyAtX(((x * 2 + time / 10) / 8), amplitude, frequency) - Math.cos(time / 40) / 2//height * (1 - levelProgress) + wavePeaksOnly(amplitude, frequency, numPoints);
        context.lineTo(x, y);
    }
    context.lineTo(width, 0);
    context.lineTo(0, 0);
    context.closePath();
    context.fill();

    time++;
    requestAnimationFrame(createWaterSurface);
}

// Start the animation
createWaterSurface();