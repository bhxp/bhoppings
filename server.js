const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to get file content
const getFile = (baseDir, url, name) => {
  try {
    // Normalize the URL to remove any leading slashes
    const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;

    // If the URL is absolute (starts with a directory), use it directly
    // Otherwise, join it with the baseDir
    const relativePath = url.startsWith("/")
      ? normalizedUrl
      : path.join(baseDir, normalizedUrl);

    // Create the full path
    const filePath = path.join(__dirname, "public", relativePath);

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
  let filePath = path.join(__dirname, "public", req.path);

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

      console.log("Base directory:", baseDir); // Debug log

      // Replace preload tags with file contents
      let modifiedData = data.replace(
        /<preload\s+name="([^"]+)"\s+src="([^"]+)"(?:\s*\/>|>\s*<\/preload>)/g,
        (match, name, url) => getFile(baseDir, url, name),
      );

      // Inject the preload script
      modifiedData = modifiedData.replace(
        `</body>`,
        `<!-- preload script injected by server software, ignore -->
        <script type="text/javascript" src="/preload.js"></script>
        </body>`,
      );

      res.set("Content-Type", "text/html");
      res.send(modifiedData);
    });
  } else {
    next();
  }
};

app.get("/tango", (req, res) => {
  res.redirect("/tangini");
});

app.use(processPreloadTags);
app.use(express.static(path.join(__dirname, "public")));

// 404 handler
app.use((req, res) => {
  let filePath = path.join(__dirname, "public/404/index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("404 Not Found");
    }

    const modifiedData = data.replace(
      /<preload\s+name="([^"]+)"\s+src="([^"]+)"\s*\/>/g,
      (match, name, url) => getFile("404", url, name),
    );

    res.status(404).send(modifiedData);
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
