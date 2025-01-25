const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
/*
// Load redirects from redirects.json (array format)
const redirects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "redirects.json"), "utf-8"),
);

app.use(express.json()); // Middleware to parse JSON requests
app.use(express.static(path.join(__dirname, "public")));

// Normalize paths with no trailing slash (redirect them to paths with trailing slash)
app.use((req, res, next) => {
  if (req.path[req.path.length - 1] !== "/" && req.path !== "/") {
    return res.redirect(301, req.path + "/");
  }
  next();
});

// Setup all redirects from redirects.json array
redirects.forEach((redirect) => {
  app.get(redirect.from, (req, res) => {
    res.redirect(redirect.to);
  });
});
*/

app.get("/tango", (req, res) => {
  res.redirect("/tangini");
});

app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public/404/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});