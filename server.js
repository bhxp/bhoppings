const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Ensure you have this dependency

const app = express();
const PORT = process.env.PORT || 3000;

const binId = '67359ccaad19ca34f8c9de30'; // Replace with your actual bin ID
const apiKey = '$2a$10$PdE8DlpdPuENmEfETNioOOROSZ8bMS7wVMiNa7YN415QGW907Fwwm'; // Replace with your JSONBin API key

// Function to get the current visit count
async function getCounter() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
      headers: {
        'X-Master-Key': apiKey,
      },
    });
    const data = await response.json();
    return data.record.visitCount;
  } catch (error) {
    console.error('Error fetching counter:', error);
    return null;
  }
}

// Function to increment the visit count
async function updateCounter() {
  try {
    const currentCount = await getCounter();
    if (currentCount === null) return;
    const updatedCount = currentCount + 1;

    // Update the count in JSONBin
    await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey,
      },
      body: JSON.stringify({ visitCount: updatedCount }),
    });
  } catch (error) {
    console.error('Error updating counter:', error);
  }
}

// Middleware to update the counter for the root path
app.use((req, res, next) => {
  if (req.path === '/') {
    updateCounter();
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Redirect /tango to /tangini
app.get('/tango', (req, res) => {
  res.redirect('/tangini');
});

// Respond with the current visit count as plain text
app.get('/get_views', async (req, res) => {
  const currentCount = await getCounter();
  if (currentCount !== null) {
    res.send(String(currentCount)); // Send the count as plain text
  } else {
    res.status(500).send('Unable to fetch visit count');
  }
});

// Redirect /pussy to the image
app.get('/pussy', (req, res) => {
  res.redirect('/images/pussy.jpg');
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '/404'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
