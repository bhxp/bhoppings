// devmenu.js

// Styles for the developer menu
const menuStyles = `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  height: 80%;
  background-color: #000;
  color: #fff;
  border: 1px solid #333;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  font-family: Arial, sans-serif;
  z-index: 9999;
  overflow-y: auto;
  display: none; /* Hidden by default */
  cursor: default !important; /* Ensure default cursor */
`;

// Styles for buttons
const buttonStyles = `
  display: block;
  width: 100%;
  padding: 10px 15px;
  margin-top: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

// Create the developer menu container
const devMenu = document.createElement('div');
devMenu.style.cssText = menuStyles;
devMenu.innerHTML = `
  <div style="padding: 10px;">
    <h2 style="margin: 0; font-size: 20px;">Developer Menu</h2>
    <button style="float: right; background-color: transparent; border: none; cursor: pointer; color: #fff;" onclick="toggleDevMenu()">✖</button>
  </div>
  <hr style="margin: 0; border-color: #333;">
  <div style="padding: 10px;">
    <h3>Fun Features</h3>
    <button style="${buttonStyles}" onclick="discoMode()">Disco Mode!</button>
    <button style="${buttonStyles}" onclick="spinText()">Spin Text!</button>
    <button style="${buttonStyles}" onclick="makeEverythingBouncy()">Make Everything Bouncy!</button>
    <button style="${buttonStyles}" onclick="messWithImages()">Mess with Images!</button>
  </div>
`;

// Toggle visibility of the developer menu
function toggleDevMenu() {
  devMenu.style.display = devMenu.style.display === 'none' ? 'block' : 'none';
  document.body.style.cursor = devMenu.style.display === 'none' ? 'auto' : 'default'; // Adjust body cursor based on menu visibility
}

// Handle F8 key press to toggle the menu
document.addEventListener('keydown', function(event) {
  if (event.key === 'F8') {
    toggleDevMenu();
  }
});

// Fun features
function discoMode() {
  const body = document.body;
  const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00', '#0000ff'];
  let interval = setInterval(function() {
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    body.style.backgroundColor = randomColor;
  }, 500);
  setTimeout(function() {
    clearInterval(interval);
    body.style.backgroundColor = '#000';
  }, 5000);
}

function spinText() {
  const elements = document.querySelectorAll('*');
  elements.forEach(function(el) {
    el.style.transition = 'transform 0.5s ease-in-out';
    el.style.transform = 'rotate(360deg)';
  });
  setTimeout(function() {
    elements.forEach(function(el) {
      el.style.transition = '';
      el.style.transform = '';
    });
  }, 2000);
}

function makeEverythingBouncy() {
  const elements = document.querySelectorAll('*');
  elements.forEach(function(el) {
    el.style.transition = 'transform 0.2s ease-in-out';
    el.style.transform = 'scale(1.1)';
  });
  setTimeout(function() {
    elements.forEach(function(el) {
      el.style.transition = '';
      el.style.transform = '';
    });
  }, 3000);
}

function messWithImages() {
  const images = document.querySelectorAll('img');
  images.forEach(function(img) {
    img.style.transition = 'transform 0.5s ease-in-out';
    img.style.transform = 'rotate(180deg) scale(1.2)';
  });
  setTimeout(function() {
    images.forEach(function(img) {
      img.style.transition = '';
      img.style.transform = '';
    });
  }, 2000);
}

// Append the developer menu to the body of the page
document.body.appendChild(devMenu);
