const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

// Helper function to get file content
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

// Custom middleware to handle relative paths
const handleRelativePaths = (req, res, next) => {
  // Skip if it's a request for a directory or has an absolute path
  if (req.path.endsWith('/') || req.path.startsWith('/_next') || req.path.includes('.html')) {
    return next();
  }

  // Get the directory path from the referrer
  const referrer = req.get('Referrer');
  if (!referrer) {
    return next();
  }

  try {
    // Parse the referrer URL
    const referrerUrl = new URL(referrer);
    // Get the directory path from the referrer
    const dirPath = path.dirname(referrerUrl.pathname);
    
    // Construct the full file path
    const fileName = path.basename(req.path);
    const possiblePath = path.join(process.cwd(), "public", dirPath, fileName);
    
    console.log("Checking relative path:", possiblePath);

    // Check if the file exists in the same directory as the referring HTML
    if (fs.existsSync(possiblePath) && fs.statSync(possiblePath).isFile()) {
      return res.sendFile(possiblePath);
    }
  } catch (err) {
    console.error("Error handling relative path:", err);
  }

  // If we couldn't find the file, continue to next middleware
  next();
};

const processPreloadTags = (req, res, next) => {
  let filePath = path.join(process.cwd(), "public", req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && path.extname(filePath) === ".html") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return next(err);
      }
      
      const baseDir = path.dirname(req.path).substring(1);
      
      let modifiedData = data.replace(
        /<preload\s+name="([^"]+)"\s+src="([^"]+)"(?:\s*\/>|>\s*<\/preload>)/g,
        (match, name, url) => getFile(baseDir, url, name)
      );

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

// Add the relative path handler before static files
app.use(handleRelativePaths);

// Preload tags processor
app.use(processPreloadTags);

// Static file serving
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