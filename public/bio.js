var canvas = document.getElementById("effect");
var ctx = canvas.getContext("2d");
var particles = [];
var particleCount = 150;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var mouseX = 0;
var mouseY = 0;
var mouseXMiddle = 0;
var catX = 0;

$(document).on("mousemove", e => {
  mouseX = e.pageX;
  mouseY = e.pageY;
  mouseXMiddle = mouseX - (canvas.width / 2);
});

var localStorage = window.localStorage;

$(document).ready(function() {


  var text = "Click to enter...";
  var textLength = text.length;
  var currentIndex = 0;
  var interval = 100; // Interval between letter changes in milliseconds

  function animateText() {
    // Clear previous text
    $('#animatedText').empty();

    // Loop through each letter
    for (var i = 0; i < textLength; i++) {
      var letter = $('<span>').addClass('char').text(text.charAt(i));
      if (i === currentIndex) {
        // Apply CSS for the current character
        letter.css('text-shadow', '0px 0px 8px rgba(255, 255, 255, 1)');
      }
      $('#animatedText').append(letter);
    }

    // Move to the next letter sequence
    currentIndex = (currentIndex + 1) % textLength;

    // Repeat the animation
    setTimeout(animateText, interval);
  }

  // Start the animation
  animateText();
});





document.addEventListener("keydown", e => {
  if (e.key == " ") {
    catX = 0;
  }
  if (e.key == "h") {
    window.open("/home", "_self");
  }
});



$("#cover").click(function() {
  $(this).fadeOut(500);
  $("container").css("animation", "slideInFromTop 0.5s ease-in-out")
})


class Particle {
  constructor() {
    this.y = Math.random() * canvas.height;
    this.x = Math.random() * canvas.width
    this.dir = randomAngleDownwards()
    this.size = Math.random() * 3 + 1;
  }

  reset() {
    //const random = (Math.random() * (canvas.width + canvas.height)) + (canvas.height / canvas.width * mouseXMiddle)
    const random = (Math.random() * (canvas.width + canvas.height * 2))
    let x;
    let y;
    if (random <= canvas.height) {
      x = 0;
      y = random;
    } else if (random >= canvas.height && random <= canvas.width + canvas.height) {
      x = random - canvas.height;
      y = 0;
    } else if (random >= canvas.width + canvas.height) {
      x = canvas.width;
      y = random - canvas.width - canvas.height;
    } else {
      x = 0;
      y = 0;
      console.warn("Conditions for snow particle reset failed; Defaulting to top left (0, 0).")
    }
    this.x = x;
    this.y = y;
    return [x, y];
  }

  move() {
    this.x += Math.cos(this.dir) * 2;
    this.y += Math.sin(this.dir) * 2;
    this.x += mouseXMiddle / canvas.width * 10;
  }
}
function randomAngleDownwards() {
  // Generate a random number between Math.PI * 0.25 and Math.PI * 0.75
  return Math.random() * (Math.PI * 0.4) + Math.PI * 0.35;
}




function createParticle() {
  return new Particle();
}



var tango = new Image("tango.png");

function render() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(tango, catX, 500, 50, 50);
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    particle.move();
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    if (particle.y > canvas.height || particle.x < 0 || particle.x > canvas.width) {
      particle.reset();
    }
  }
  if (catX < canvas.width) {
    catX += 1.5;
  }
  requestAnimationFrame(render);
}


$(document).ready((e) => {
  for (let i = 0; i < particleCount; i++) {
    let particle = createParticle();
    particle.reset();
    particles.push(particle);
  }
  requestAnimationFrame(render)

})

document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    window.open("/home", "_self");
  }
});
    async function updateCounter() {
      try {
        // Fetch current count from JSONBin
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
          headers: {
            'X-Master-Key': apiKey,
          }
        });
        const data = await response.json();
        let count = data.record.visitCount;
        // Display current count

      } catch (error) {
        console.error('Error updating counter:', error);
        document.getElementById('count').innerText = 'Error';
      }
    }

    updateCounter();