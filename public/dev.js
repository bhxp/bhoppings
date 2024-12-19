// devmenu.js

// Create a div element for the developer menu
const devMenu = document.createElement('div');
devMenu.style.position = 'fixed';
devMenu.style.top = '10px';
devMenu.style.right = '10px';
devMenu.style.width = '300px';
devMenu.style.height = '80%';
devMenu.style.backgroundColor = '#f0f0f0';
devMenu.style.border = '1px solid #ccc';
devMenu.style.padding = '10px';
devMenu.style.zIndex = '9999';
devMenu.style.display = 'none'; // Initially hidden
devMenu.innerHTML = `
  <h2>Developer Menu</h2>
  <button onclick="toggleDevMenu()">Close</button>
  <hr>
  <div id="debugInfo">
    <!-- Debug information will be displayed here -->
  </div>
  <hr>
  <h3>Modify Data</h3>
  <button onclick="modifyData()">Modify Data</button>
  <h3>Insert Custom Data</h3>
  <button onclick="insertCustomData()">Insert Custom Data</button>
  <hr>
  <h3>Network</h3>
  <button onclick="clearNetwork()">Clear Network</button>
  <h4>XHR Requests</h4>
  <div id="xhrRequests">
    <!-- XHR request information will be displayed here -->
  </div>
  <hr>
  <h3>Console</h3>
  <button onclick="clearConsole()">Clear Console</button>
  <div id="consoleOutput">
    <!-- Console output will be displayed here -->
  </div>
`;

// Function to toggle visibility of the developer menu
function toggleDevMenu() {
  if (devMenu.style.display === 'none') {
    devMenu.style.display = 'block';
    refreshNetworkRequests();
    refreshConsoleOutput();
  } else {
    devMenu.style.display = 'none';
  }
}

// Function to handle F8 key press to toggle the menu
document.addEventListener('keydown', function(event) {
  if (event.key === 'F8') {
    toggleDevMenu();
  }
});

// Function to display debug information
function displayDebugInfo(info) {
  const debugInfo = document.getElementById('debugInfo');
  debugInfo.innerHTML = `<pre>${info}</pre>`;
}

// Example function to modify data (replace with actual functionality)
function modifyData() {
  console.log('Modify Data button clicked');
  // Example: Modify a sample variable
  sampleData = 'Modified Data';
  displayDebugInfo(`Modified data: ${sampleData}`);
}

// Example function to insert custom data (replace with actual functionality)
function insertCustomData() {
  console.log('Insert Custom Data button clicked');
  // Example: Insert a new object
  const customData = { name: 'Custom Object', value: 123 };
  displayDebugInfo(`Inserted custom data: ${JSON.stringify(customData)}`);
}

// Function to clear network requests
function clearNetwork() {
  const xhrRequests = document.getElementById('xhrRequests');
  xhrRequests.innerHTML = '';
}

// Function to refresh network requests
function refreshNetworkRequests() {
  const xhrRequests = document.getElementById('xhrRequests');
  xhrRequests.innerHTML = 'No XHR requests yet.';
  // Example: Track XHR requests
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    this.addEventListener('load', function() {
      xhrRequests.innerHTML += `<div>URL: ${this.responseURL}, Status: ${this.status}</div>`;
    });
    open.apply(this, arguments);
  };
}

// Function to clear console output
function clearConsole() {
  const consoleOutput = document.getElementById('consoleOutput');
  consoleOutput.innerHTML = '';
}

// Function to refresh console output
function refreshConsoleOutput() {
  const consoleOutput = document.getElementById('consoleOutput');
  console.log = function(message) {
    consoleOutput.innerHTML += `<div>${message}</div>`;
  };
}

// Append the developer menu to the body of the page
document.body.appendChild(devMenu);
