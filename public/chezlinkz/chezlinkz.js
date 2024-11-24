const box = document.querySelector('#background');
const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
  const { clientX: mouseX, clientY: mouseY } = event;
  const rotationY = ((mouseX - centerX) / centerX) * 30; // Rotate on Y-axis
  const rotationX = -((mouseY - centerY) / centerY) * 30; // Rotate on X-axis

  box.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
});