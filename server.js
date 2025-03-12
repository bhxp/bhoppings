const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "public", "/images/favicon.ico")),
);

// Import the auth module
const auth = require("./auth");

// Set up middleware for parsing request bodies
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Initialize auth middleware asynchronously
(async function () {
  try {
    // Initialize auth - this will set up Redis and sessions
    await auth.setup(app);
    console.log("Authentication system initialized successfully");

    // Continue with server setup after auth is initialized
    setupServer();
  } catch (error) {
    console.error("Failed to initialize authentication:", error);
    process.exit(1);
  }
})();

function setupServer() {
  // Protect routes that require authentication
  // Place this after your public routes like "/" but before protected routes
  app.use((req, res, next) => {
    // Skip authentication for public routes
    if (
      req.path === "/" ||
      req.path.startsWith("/login") ||
      req.path === "/login_process" ||
      req.path === "/signup_process"
    ) {
    }
    return next();

    // Check if user is authenticated
    if (!req.session || !req.session.user) {
      return res.redirect("/login");
    }

    next();
  });

  // Example of using the auth API in your routes
  app.get("/profile", (req, res) => {
    // Get user data
    auth
      .getUserData(req.session.user.username)
      .then((userData) => {
        const responseData = JSON.stringify(userData);
        res.send(responseData);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        res.status(500).send("Server error");
      });
  });

  // Login route
  app.post("/login_process", async (req, res) => {
    const { username, password } = req.body;

    try {
      const result = await auth.authenticate(username, password);

      if (result.success) {
        // Store user in session
        req.session.user = {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
        };

        return res.redirect("/dashboard");
      } else {
        return res.redirect("/login?error=invalid_credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      return res.redirect("/login?error=server_error");
    }
  });

  // Signup route
  app.post("/signup_process", async (req, res) => {
    const { username, password, email } = req.body;

    try {
      const result = await auth.register({ username, password, email });

      if (result.success) {
        // Auto-login after registration
        req.session.user = {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
        };

        return res.redirect("/dashboard");
      } else {
        return res.redirect(
          "/login?error=" + encodeURIComponent(result.message),
        );
      }
    } catch (error) {
      console.error("Registration error:", error);
      return res.redirect("/login?error=server_error");
    }
  });

  // Logout route
  app.get("/logout", async (req, res) => {
    try {
      await auth.logout(req);
      res.redirect("/login");
    } catch (error) {
      console.error("Logout error:", error);
      res.redirect("/");
    }
  });

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
      const filePath = path.join(
        process.cwd(),
        "public",
        baseDir,
        normalizedUrl,
      );

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

  const appendAccountLib = (req, res, next) => {
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
        modifiedData = data.replace(
          `</body>`,
          `<!-- account library injected by server, ignore -->
          <script type="text/javascript" src="/account-data.js"></script>
          </body>`,
        );

        res.set("Content-Type", "text/html");
        res.send(modifiedData);
      });
    } else {
      next();
    }
  };

  app.use(appendAccountLib);

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

  // Log that server is fully configured
  console.log("Server routes and middleware configured");
}

// 6️⃣ Export for Vercel
module.exports = app;

// 7️⃣ Start server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
