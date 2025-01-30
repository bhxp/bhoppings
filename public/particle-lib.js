"use strict";

const particleCanvas = $("<canvas>")
  .attr({
    width: window.innerWidth,
    height: window.innerHeight,
  })
  .css({
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10000,
    pointerEvents: "none",
  });

const particleCtx = particleCanvas[0].getContext("2d");

$("body").append(particleCanvas);

// Adjust canvas size on window resize
$(window).on("resize", function () {
  particleCanvas.attr({
    width: window.innerWidth,
    height: window.innerHeight,
  });
});

class Effect {
  constructor(options) {
    this.particleCount = options.particleCount || 100;
    this.particleSize = options.particleSize || { min: 3, max: 6 };
    this.particleSpeed = options.particleSpeed || { min: 1, max: 3 };
    this.particleColor = options.particleColor || "rgba(255, 255, 255, 0.8)";
    this.effectBounds = options.effectBounds || {};
    this.behaviors = options.behaviors || {};
    this.loop = options.loop || false;
    this.particles = [];
    this.isExplode = this.behaviors.explode || false;
    this.isFall = this.behaviors.fall || false;
    this.particleImage = options.particleImage || null;
    this.opacityFade = options.opacityFade || false; // Enable or disable fade-out
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      const size =
        Math.random() * (this.particleSize.max - this.particleSize.min) +
        this.particleSize.min;
      const speed =
        Math.random() * (this.particleSpeed.max - this.particleSpeed.min) +
        this.particleSpeed.min;

      let x,
        y,
        speedX = 0,
        speedY = 0;

      if (this.isFall) {
        x =
          this.effectBounds.centerX -
          this.effectBounds.width / 2 +
          Math.random() * this.effectBounds.width;
        y = this.effectBounds.centerY - this.effectBounds.height / 2;
        speedY =
          Math.random() * (this.particleSpeed.max - this.particleSpeed.min) +
          this.particleSpeed.min;
      } else if (this.isExplode) {
        x = this.effectBounds.centerX;
        y = this.effectBounds.centerY;

        const angle = Math.random() * Math.PI * 2;
        const speedFactor = Math.random() * speed;

        speedX = Math.cos(angle) * speedFactor;
        speedY = Math.sin(angle) * speedFactor;
      }

      const particle = new LibParticle({
        size,
        speed,
        color: this.particleColor,
        x,
        y,
        speedX,
        speedY,
        image: this.particleImage, // Pass the image to each particle
      });
      this.particles.push(particle);
    }
    console.log("Effect initialized with", this.particleCount, "particles");
  }

  render() {
    this.particles.forEach((particle) => {
      const outsideBounds = this.checkIfOutsideBounds(particle);

      if (outsideBounds) {
        if (!this.loop) {
          particle.x = -1000;
          particle.y = -1000;
        } else {
          if (this.isFall) {
            particle.x =
              this.effectBounds.centerX -
              this.effectBounds.width / 2 +
              Math.random() * this.effectBounds.width;
            particle.y =
              this.effectBounds.centerY - this.effectBounds.height / 2;
            particle.speedY =
              Math.random() *
                (this.particleSpeed.max - this.particleSpeed.min) +
              this.particleSpeed.min;
          } else if (this.isExplode) {
            particle.x = this.effectBounds.centerX;
            particle.y = this.effectBounds.centerY;

            const angle = Math.random() * Math.PI * 2;
            const speedFactor = Math.random() * particle.speed;
            particle.speedX = Math.cos(angle) * speedFactor;
            particle.speedY = Math.sin(angle) * speedFactor;
          }
        }
      }

      // Calculate fade-out opacity if enabled
      if (this.opacityFade && this.effectBounds.type === "circle") {
        const distanceFromCenter = Math.sqrt(
          Math.pow(particle.x - this.effectBounds.centerX, 2) +
            Math.pow(particle.y - this.effectBounds.centerY, 2),
        );
        const maxDistance = this.effectBounds.radius;
        particle.opacity = 1 - Math.min(distanceFromCenter / maxDistance, 1);
      } else {
        particle.opacity = 1; // Full opacity if fading is disabled
      }

      // Render the particle
      if (particle.image) {
        const img = new Image();
        img.src = particle.image;
        particleCtx.globalAlpha = particle.opacity; // Apply opacity
        particleCtx.drawImage(
          img,
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size,
        );
        particleCtx.globalAlpha = 1; // Reset globalAlpha
      } else {
        particleCtx.beginPath();
        particleCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        particleCtx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`; // Use particle opacity
        particleCtx.fill();
        particleCtx.closePath();
      }

      if (this.isFall) {
        particle.y += particle.speedY;
      } else if (this.isExplode) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
      }

      if (
        this.isFall &&
        particle.y > this.effectBounds.centerY + this.effectBounds.height / 2
      ) {
        particle.y = this.effectBounds.centerY - this.effectBounds.height / 2;
      }
    });
  }

  checkIfOutsideBounds(particle) {
    // For rectangular bounds
    if (this.effectBounds.type === "rect") {
      const left = this.effectBounds.centerX - this.effectBounds.width / 2;
      const right = this.effectBounds.centerX + this.effectBounds.width / 2;
      const top = this.effectBounds.centerY - this.effectBounds.height / 2;
      const bottom = this.effectBounds.centerY + this.effectBounds.height / 2;

      return (
        particle.x < left ||
        particle.x > right ||
        particle.y < top ||
        particle.y > bottom
      );
    }

    // For circular bounds
    if (this.effectBounds.type === "circle") {
      const distance = Math.sqrt(
        Math.pow(particle.x - this.effectBounds.centerX, 2) +
          Math.pow(particle.y - this.effectBounds.centerY, 2),
      );
      return distance > this.effectBounds.radius;
    }

    return false;
  }

  reset() {
    this.particles = [];
    this.init();
  }

  play() {
    this.reset(); // Reset particles to their starting positions
    this.render(); // Start rendering again
  }
}

// Assuming you already have your Effect and EffectManager classes
class EffectManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.particleCtx = canvas[0].getContext("2d");
    this.effects = [];
  }

  addEffect(effect) {
    this.effects.push(effect);
    effect.init();
  }

  start() {
    const renderFrame = () => {
      this.particleCtx.clearRect(
        0,
        0,
        this.canvas.width(),
        this.canvas.height(),
      );
      this.effects.forEach((effect) => effect.render());
      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  triggerEffectOnElement(effect, element) {
    const rect = element.getBoundingClientRect(); // Get position of the element
    const effectBounds = {
      type: effect.effectBounds.type,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      radius: Math.max(rect.height, rect.width) / 2 || 20,
    };
    console.log(effectBounds);

    if (!effect.overrideBounds) {
      effectBounds.width = rect.width || 20;
      effectBounds.height = rect.height || 20;
    }

    // Update the effect bounds to match the element's position
    effect.effectBounds = effectBounds;
    effect.play(); // Trigger the effect
  }
}

class LibParticle {
  constructor(options) {
    this.size = options.size || 5;
    this.originalSize = options.originalSize || options.size || 5;
    this.speed = options.speed || 1;
    this.color = options.color || "rgba(255, 255, 255, 0.8)";
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.speedX = options.speedX || 0;
    this.speedY = options.speedY || 0;
    this.image = options.image || null;
    this.opacity = 1;
    this.angle = options.angle || 0;
    this.radius = options.radius || 0;
  }
}
