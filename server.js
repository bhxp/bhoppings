const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const binId = '67359ccaad19ca34f8c9de30'; // Replace with your actual bin ID
const apiKey = '$2a$10$PdE8DlpdPuENmEfETNioOOROSZ8bMS7wVMiNa7YN415QGW907Fwwm'; // Replace with your JSONBin API key

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
        // Increment the counter
        count += 1;
        // Update the count in JSONBin
        await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
          },
          body: JSON.stringify({ visitCount: count })
      });
  } catch (error) {
    console.error('Error updating counter:', error);
  }
}
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

app.get('/', (req, res) => {
  updateCounter();
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '/404'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});