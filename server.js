const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "public", "/images/favicon.ico")),
);

const fixRelativePaths = (req, res, next) => {
  if (req.path.endsWith("/") || req.path.endsWith(".html")) {
    return next(); // Skip directories and HTML files
  }

  const referrer = req.get("Referrer");
  if (!referrer) return next();

  try {
    const referrerUrl = new URL(referrer);
    let basePath = referrerUrl.pathname;

    // Ensure the referrer path is treated as a directory
    if (!basePath.endsWith("/")) {
      basePath += "/"; // Force it to behave like a directory
    }

    const correctedPath = path.join(
      process.cwd(),
      "public",
      basePath,
      req.path,
    );

    if (fs.existsSync(correctedPath) && fs.statSync(correctedPath).isFile()) {
      return res.sendFile(correctedPath);
    }
  } catch (err) {
    console.error("Error fixing relative paths:", err);
  }

  next();
};

app.use(fixRelativePaths);

// 2️⃣ Handle preload tags before serving static files
const getFile = (baseDir, url, name) => {
  try {
    const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
    const filePath = path.join(process.cwd(), "public", baseDir, normalizedUrl);

    console.log("Attempting to read file:", filePath);

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
  let filePath = path.join(process.cwd(), "public", req.path);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (fs.existsSync(filePath) && path.extname(filePath) === ".html") {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return next(err);
      }
      // <preload src="$URL"></preload>
      const preloadTagRegex =
        /<preload\s+name="([^"]+)"\s+src="([^"]+)"(?:\s*\/>|>\s*<\/preload>)/g;
      const baseDir = path.dirname(req.path).substring(1);
      let modifiedData = data;
      // Use the regex's test method on the string `data`
      if (preloadTagRegex.test(data)) {
        modifiedData = data.replace(
          `</body>`,
          `<!-- preload script injected by server software, ignore -->
          <script type="text/javascript" src="/preload.js"></script>
          </body>`,
        );

        modifiedData = modifiedData.replace(
          preloadTagRegex,
          (match, name, url) => getFile(baseDir, url, name),
        );
      }

      res.set("Content-Type", "text/html");
      res.send(modifiedData);
    });
  } else {
    next();
  }
};

app.use(processPreloadTags);

app.get("/app-icon", (req, res, next) => {
  const filePath = path.join(__dirname, "public", "ai/app-icon/index.html"); // Adjust path as needed
  res.sendFile(filePath, (err) => {
    if (err) {
      next(err); // Pass errors to the error handler
    }
  });
});

// 3️⃣ Serve static files after processing
app.use(express.static(path.join(process.cwd(), "public")));

// 4️⃣ Handle custom redirects
app.get("/tango", (req, res) => {
  res.redirect("/tangini");
});

// 5️⃣ Handle 404 errors (relative paths still apply here)
app.use((req, res) => {
  let filePath = path.join(process.cwd(), "public/404/index.html");
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

// 6️⃣ Export for Vercel
module.exports = app;

// 7️⃣ Start server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
