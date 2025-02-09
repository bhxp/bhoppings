document.addEventListener('DOMContentLoaded', () => {
  // Audio setup
  const audio = document.getElementById('backgroundMusic');
  const root = document.documentElement;
  const title = document.querySelector('.title');
  const intro = document.querySelector('.intro');

  // Set initial volume
  audio.volume = 0.3;

  intro.addEventListener('click', async () => {
    try {
      await audio.play();
      intro.classList.remove('active');
      updateBackgroundState(true);
    } catch (e) {
      console.log('Playback failed:', e);
    }
  });

  let currentBgColor = { r: 255, g: 255, b: 255, a: 0.95 };
  let targetBgColor = { r: 0, g: 255, b: 0, a: 1 };

  function updateBackgroundState(playing, progress = 1) {
    // Interpolate between colors based on progress (0 to 1)
    const startColor = playing ? 
      { r: 255, g: 255, b: 255, a: 0.95 } : 
      { r: 0, g: 255, b: 0, a: 1 };

    const endColor = playing ? 
      { r: 0, g: 255, b: 0, a: 1 } : 
      { r: 255, g: 255, b: 255, a: 0.95 };

    const r = startColor.r + (endColor.r - startColor.r) * progress;
    const g = startColor.g + (endColor.g - startColor.g) * progress;
    const b = startColor.b + (endColor.b - startColor.b) * progress;
    const a = startColor.a + (endColor.a - startColor.a) * progress;

    currentBgColor = { r, g, b, a };

    root.style.setProperty('--bg-color', `rgba(${r}, ${g}, ${b}, ${a})`);
    root.style.setProperty('--bg-speed', playing ? '150s' : '300s');
  }

  // Mouse movement handling for background effect
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;

    const container = document.querySelector('.container');
    container.style.setProperty('--translateX', `${mouseX * 0.5}px`);
    container.style.setProperty('--translateY', `${mouseY * 0.5}px`);
  });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouseX = (touch.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (touch.clientY / window.innerHeight - 0.5) * 20;

    const container = document.querySelector('.container');
    container.style.setProperty('--translateX', `${mouseX * 0.5}px`);
    container.style.setProperty('--translateY', `${mouseY * 0.5}px`);
  });
});