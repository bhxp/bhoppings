var canvas = document.getElementById("effect");
var ctx = canvas.getContext("2d");
var particles = [];
var particleCount = 150;
var mouseX = 0;
var mouseY = 0;
var mouseXMiddle = 0;
var catX = 0;

$(document).on("mousemove", (e) => {
  mouseX = e.pageX;
  mouseY = e.pageY;
  mouseXMiddle = mouseX - canvas.width / 2;
});

var localStorage = window.localStorage;

document.addEventListener("keydown", (e) => {
  if (e.key == " ") {
    catX = 0;
  }
  if (e.key == "h") {
    window.open("/home", "_self");
  }
});

$("#cover").click(function () {
  $(this).fadeOut(500);
  $("container").css("animation", "slideInFromTop 0.5s ease-in-out");
});

class Particle {
  constructor() {
    this.y = Math.random() * canvas.height;
    this.x = Math.random() * canvas.width;
    this.dir = randomAngleDownwards();
    this.size = Math.random() * 3 + 1;
  }

  reset() {
    //const random = (Math.random() * (canvas.width + canvas.height)) + (canvas.height / canvas.width * mouseXMiddle)
    const random = Math.random() * (canvas.width + canvas.height * 2);
    let x;
    let y;
    if (random <= canvas.height) {
      x = 0;
      y = random;
    } else if (
      random >= canvas.height &&
      random <= canvas.width + canvas.height
    ) {
      x = random - canvas.height;
      y = 0;
    } else if (random >= canvas.width + canvas.height) {
      x = canvas.width;
      y = random - canvas.width - canvas.height;
    } else {
      x = 0;
      y = 0;
      console.warn(
        "Conditions for snow particle reset failed; Defaulting to top left (0, 0).",
      );
    }
    this.x = x;
    this.y = y;
    return [x, y];
  }

  move() {
    this.x += Math.cos(this.dir) * 2;
    this.y += Math.sin(this.dir) * 2;
    this.x += (mouseXMiddle / canvas.width) * 10;
  }
}
function randomAngleDownwards() {
  // Generate a random number between Math.PI * 0.25 and Math.PI * 0.75
  return Math.random() * (Math.PI * 0.4) + Math.PI * 0.35;
}

function createParticle() {
  return new Particle();
}

function render() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.move();
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    if (
      particle.y > canvas.height ||
      particle.x < 0 ||
      particle.x > canvas.width
    ) {
      particle.reset();
    }
  }
  if (catX < canvas.width) {
    catX += 1.5;
  }
  requestAnimationFrame(render);
}

$(document).ready((e) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  for (let i = 0; i < particleCount; i++) {
    let particle = createParticle();
    particles.push(particle);
  }
  requestAnimationFrame(render);
});

document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    window.open("/home", "_self");
  }
});

$(document).ready(function () {
  if (localStorage.getItem("bioReferer")) {
    $("body").css("filter", "brightness(-100%)");
    const referer = localStorage.getItem("bioReferer");
    localStorage.removeItem("bioReferer");
    window.open(referer, "_self");
  }
  if (!window.opener) {
    if (localStorage.getItem("skipBio") == "true") {
      window.open("/home", "_self");
    } else if (localStorage.getItem("fromLogout") == "true") {
      localStorage.removeItem("fromLogout");
    }
  }

  const effectManager = new EffectManager(particleCanvas);

  const explodeEffect = new Effect({
    particleCount: 10,
    particleSize: { min: 1, max: 3 },
    particleSpeed: { min: 2, max: 3 },
    particleColor: "#ffffff",
    effectBounds: {
      type: "circle",
      centerX: -100,
      centerY: -100,
      radius: 150,
    },
    overrideBounds: true,
    behaviors: { explode: true, fall: false },
    opacityFade: true, // Enable fade-out effect
    loop: false,
  });

  // Add effects to the manager
  effectManager.addEffect(explodeEffect);

  // Start the particle effect rendering
  effectManager.start();
  window.e = explodeEffect;
  // Set up interactivity: trigger the explode effect when a button is hovered
  $(".link-button").on("mouseenter", function () {
    explodeEffect.reset();
    effectManager.triggerEffectOnElement(explodeEffect, this);
  });
});
