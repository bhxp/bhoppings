// Alert Button Functionality
document.getElementById('alertButton').addEventListener('click', function() {
    alert('Alert Button Clicked!');
});

// Change Color Button Functionality
document.getElementById('changeColorButton').addEventListener('click', function() {
    document.body.style.backgroundColor = '#ffcccc';
});

// Hide Button Functionality
document.getElementById('hideButton').addEventListener('click', function() {
    this.style.display = 'none';
});

// Fade Out Button Functionality
document.getElementById('fadeButton').addEventListener('click', function() {
    this.style.transition = 'opacity 1s';
    this.style.opacity = '0';
});

// Slide Toggle Button Functionality
document.getElementById('slideButton').addEventListener('click', function() {
    let main = document.querySelector('main');
    main.style.transition = 'max-height 0.5s';
    if (main.style.maxHeight) {
        main.style.maxHeight = null;
    } else {
        main.style.maxHeight = main.scrollHeight + 'px';
    }
});

// Toggle Switch Functionality
document.getElementById('toggleSwitch').addEventListener('change', function() {
    alert(`Switch is ${this.checked ? 'ON' : 'OFF'}`);
});

// Another Toggle Switch Functionality
document.getElementById('toggleSwitch2').addEventListener('change', function() {
    document.body.style.backgroundColor = this.checked ? '#cceeff' : '#f4f4f4';
});

// Text Box Button Functionality
document.getElementById('textBoxButton').addEventListener('click', function() {
    const text = document.getElementById('textBox').value;
    alert('Text in Text Box: ' + text);
});

// Input Box Button Functionality
document.getElementById('inputBoxButton').addEventListener('click', function() {
    const text = document.getElementById('inputBox').value;
    alert('Input Box Text: ' + text);
});

// Apply Background Color Functionality
document.getElementById('applyBgColor').addEventListener('click', function() {
    const bgColor = document.getElementById('bgColor').value;
    document.body.style.backgroundColor = bgColor;
});

// Apply Text Color Functionality
document.getElementById('applyTextColor').addEventListener('click', function() {
    const textColor = document.getElementById('textColor').value;
    document.body.style.color = textColor;
});

// Apply Font Size Functionality
document.getElementById('applyFontSize').addEventListener('click', function() {
    const fontSize = document.getElementById('fontSize').value;
    document.body.style.fontSize = fontSize + 'px';
});

// Swap Images Functionality
document.getElementById('swapImageButton').addEventListener('click', function() {
    const img1 = document.getElementById('image1');
    const img2 = document.getElementById('image2');
    const tempSrc = img1.src;
    img1.src = img2.src;
    img2.src = tempSrc;
});

// Add Row Functionality
document.getElementById('addRowButton').addEventListener('click', function() {
    const table = document.getElementById('sampleTable');
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    cell1.textContent = 'New Name';
    cell2.textContent = 'New Age';
});

// Delete Row Functionality
document.getElementById('deleteRowButton').addEventListener('click', function() {
    const table = document.getElementById('sampleTable');
    if (table.rows.length > 2) {  // Keep header row
        table.deleteRow(-1);
    }
});

// Form Submit Functionality
document.getElementById('sampleForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const output = document.getElementById('formOutput');
    output.textContent = `Submitted: Name - ${name}, Age - ${age}`;
});

// Add Item to List Functionality
document.getElementById('addItemButton').addEventListener('click', function() {
    const list = document.getElementById('sampleList');
    const newItem = document.createElement('li');
    newItem.textContent = 'New Item';
    list.appendChild(newItem);
});

// Remove Item from List Functionality
document.getElementById('removeItemButton').addEventListener('click', function() {
    const list = document.getElementById('sampleList');
    if (list.children.length > 0) {
        list.removeChild(list.lastChild);
    }
});
