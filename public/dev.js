// devmenu.js

// Styles for the developer menu
const menuStyles = `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  height: 80%;
  background-color: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  z-index: 9999;
  overflow-y: auto;
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
    <button style="float: right; background-color: transparent; border: none; cursor: pointer;" onclick="toggleDevMenu()">✖</button>
  </div>
  <hr style="margin: 0;">
  <div id="debugInfo" style="padding: 10px;">
    <!-- Debug information will be displayed here -->
  </div>
  <hr style="margin: 0;">
  <div style="padding: 10px;">
    <h3 style="margin-top: 0;">Modify Data</h3>
    <button style="${buttonStyles}" onclick="modifyData()">Modify Data</button>
    <h3>Insert Custom Data</h3>
    <button style="${buttonStyles}" onclick="insertCustomData()">Insert Custom Data</button>
  </div>
  <hr style="margin: 0;">
  <div style="padding: 10px;">
    <h3>Network</h3>
    <button style="${buttonStyles}" onclick="clearNetwork()">Clear Network</button>
    <div id="xhrRequests" style="margin-top: 10px; font-size: 14px; color: #333;">
      No XHR requests yet.
    </div>
  </div>
  <hr style="margin: 0;">
  <div style="padding: 10px;">
    <h3>Console</h3>
    <button style="${buttonStyles}" onclick="clearConsole()">Clear Console</button>
    <div id="consoleOutput" style="margin-top: 10px; font-size: 14px; color: #333;">
      <!-- Console output will be displayed here -->
    </div>
  </div>
`;

// Toggle visibility of the developer menu
function toggleDevMenu() {
  devMenu.style.display = devMenu.style.display === 'none' ? 'block' : 'none';
}

// Handle F8 key press to toggle the menu
document.addEventListener('keydown', function(event) {
  if (event.key === 'F8') {
    toggleDevMenu();
  }
});

// Display debug information
function displayDebugInfo(info) {
  const debugInfo = document.getElementById('debugInfo');
  debugInfo.innerHTML = `<pre>${info}</pre>`;
}

// Modify data example function
function modifyData() {
  console.log('Modify Data button clicked');
  // Example: Modify a sample variable
  const newData = { example: 'New Data' };
  displayDebugInfo(`Modified data: ${JSON.stringify(newData)}`);
}

// Insert custom data example function
function insertCustomData() {
  console.log('Insert Custom Data button clicked');
  // Example: Insert a new object
  const customData = { name: 'Custom Object', value: 123 };
  displayDebugInfo(`Inserted custom data: ${JSON.stringify(customData)}`);
}

// Clear network requests function
function clearNetwork() {
  const xhrRequests = document.getElementById('xhrRequests');
  xhrRequests.innerHTML = 'No XHR requests yet.';
}

// Intercept XHR requests to display in the developer menu
function trackXHRRequests() {
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    this.addEventListener('load', function() {
      const xhrRequests = document.getElementById('xhrRequests');
      xhrRequests.innerHTML += `<div>${method} ${url}, Status: ${this.status}</div>`;
    });
    open.apply(this, arguments);
  };
}

// Clear console output function
function clearConsole() {
  const consoleOutput = document.getElementById('consoleOutput');
  consoleOutput.innerHTML = '';
}

// Redirect console.log output to the developer menu
function trackConsoleOutput() {
  console.log = function(message) {
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML += `<div>${message}</div>`;
  };
}

// Append the developer menu to the body of the page
document.body.appendChild(devMenu);

// Initialize features
trackXHRRequests();
trackConsoleOutput();
