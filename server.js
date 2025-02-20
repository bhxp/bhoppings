const express = require("express");
const path = require("path");
const fs = require("fs");

// Create the Express app
const app = express();

// Helper function to get file content - modified for Vercel
const getFile = (baseDir, url, name) => {
  try {
    // Normalize the URL to remove any leading slashes
    const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
    
    // For Vercel, we need to use the absolute path from the project root
    const filePath = path.join(process.cwd(), "public", baseDir, normalizedUrl);
    
    console.log("Attempting to read file:", filePath); // Debug log
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const data = fs.readFileSync(filePath, "utf8");
      return `<preload name='${name}'>${data}</preload>`;
    } else {
      console.error(`File not found or is directory: ${filePath}`);
      return `<!-- File not found: ${url} -->`;
    }
  } catch (err) {
    console.error(`Error reading file ${url}:`, err);
    return `<!-- Error reading file ${url} -->`;
  }
};

const processPreloadTags = (req, res, next) => {
  // For Vercel, use process.cwd() instead of __dirname
  let filePath = path.join(process.cwd(), "public", req.path);
  
  // If the request is for a directory, append "index.html"
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  // Check if the file exists and is an HTML file
  if (fs.existsSync(filePath) && path.extname(filePath) === ".html") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return next(err);
      }
      
      // Get the directory path relative to the HTML file
      const baseDir = path.dirname(req.path).substring(1); // Remove leading slash
      
      // Replace preload tags with file contents
      let modifiedData = data.replace(
        /<preload\s+name="([^"]+)"\s+src="([^"]+)"(?:\s*\/>|>\s*<\/preload>)/g,
        (match, name, url) => getFile(baseDir, url, name)
      );

      // Inject the preload script with absolute path
      modifiedData = modifiedData.replace(
        `</body>`,
        `<!-- preload script injected by server software, ignore -->
        <script type="text/javascript" src="/preload.js"></script>
        </body>`
      );

      res.set("Content-Type", "text/html");
      res.send(modifiedData);
    });
  } else {
    next();
  }
};

// Redirect handler
app.get("/tango", (req, res) => {
  res.redirect("/tangini");
});

// Preload tags processor
app.use(processPreloadTags);

// Static file serving - specify the full path for Vercel
app.use(express.static(path.join(process.cwd(), "public")));

// 404 handler
app.use((req, res) => {
  let filePath = path.join(process.cwd(), "public/404/index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("404 Not Found");
    }
    const modifiedData = data.replace(
      /<preload\s+name="([^"]+)"\s+src="([^"]+)"\s*\/>/g,
      (match, name, url) => getFile("404", url, name)
    );
    res.status(404).send(modifiedData);
  });
});

// Export the app for Vercel
module.exports = app;

// Only start the server if we're running locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}