const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler
app.use((req, res) => {
  express.static(__dirname.join("/public/404"))
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});