const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the JSON file
const jsonFilePath = path.join(__dirname, '/data/views.json');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Increment views for the root route "/"
app.get('/', (req, res) => {
  // Ensure the JSON file exists
  if (!fs.existsSync(jsonFilePath)) {
    fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
    fs.writeFileSync(jsonFilePath, JSON.stringify({ views: 0 }, null, 2));
  }

  // Read the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).send('Internal Server Error');
    }

    try {
      const json = JSON.parse(data);
      json.views = (json.views || 0) + 1;

      // Write the updated JSON back to the file
      fs.writeFile(jsonFilePath, JSON.stringify(json, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing file:', writeErr);
          return res.status(500).send('Internal Server Error');
        }

        res.send(`Views: ${json.views}`);
      });
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Redirect /tango to /tangini
app.get('/tango', (req, res) => {
  res.redirect('/tangini');
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '/404'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
