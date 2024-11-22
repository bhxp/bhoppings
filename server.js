const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

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
