const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const { auth } = require("express-openid-connect");
const axios = require("axios");
const MongoStore = require("connect-mongo");
const app = express();

// Set up session before auth middleware
// Example with MongoDB session store

app.use(
  session({
    secret: "another-long-random-string-for-testing-only",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://cheesewhizshanahan:Milla1234$@cluster0.otg4i.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  }),
);

// Update the baseURL middleware to use HTTPS for Replit
app.use((req, res, next) => {
  // Store the original URL in the session for later redirects
  if (
    !req.session.returnTo &&
    req.originalUrl !== "/callback" &&
    !req.originalUrl.startsWith("/logout")
  ) {
    req.session.returnTo = req.originalUrl;
  }

  // Determine the base URL from the request
  let protocol = "https"; // Change to always use HTTPS for Replit

  // Only use HTTP if explicitly in local development
  if (
    process.env.NODE_ENV === "development" &&
    req.headers.host.includes("localhost")
  ) {
    protocol = "http";
  }

  const host = req.headers.host;
  req.baseURL = `${protocol}://${host}`;

  next();
});

app.use((req, res, next) => {
  const config = {
    authRequired: false,
    auth0Logout: false,
    secret: "a-long-random-string-for-testing-purposes-only",
    baseURL: `https://${req.headers.host}`,
    clientID: "DPG9wJiWT1KtMiIAKQD3vg2sRXym2hx5",
    clientSecret:
      "a-l_TGZp9jOoGudNvgqgcm1q5cQvLRZIOQQomWZIeDEB-3NBn6Q-iVAl8gCKpxIp",
    issuerBaseURL: "https://dev-cnsg5vep82aj6nfp.us.auth0.com",
    routes: {
      login: "/login",
      callback: "/callback",
    },
    authorizationParams: {
      prompt: "login", // Force login screen to show
      response_type: "code",
      scope: "openid profile email",
    },
  };

  auth(config)(req, res, next);
});

// Add this BEFORE the Auth0 middleware
app.get("/logout", (req, res) => {
  // Get the return URL before clearing session
  const returnTo = encodeURIComponent(`https://${req.headers.host}/home`);

  // Clear local session
  req.session = null;

  // Redirect to Auth0 logout
  res.redirect(
    `https://dev-cnsg5vep82aj6nfp.us.auth0.com/v2/logout?client_id=DPG9wJiWT1KtMiIAKQD3vg2sRXym2hx5&returnTo=${returnTo}`,
  );
});

// JSONbin configuration - Hardcoded for testing
const jsonbinConfig = {
  accessKey: "$2a$10$PdE8DlpdPuENmEfETNioOOROSZ8bMS7wVMiNa7YN415QGW907Fwwm",
  binId: "67d102208561e97a50ea4bb9",
  baseUrl: "https://api.jsonbin.io/v3",
};

// Add user data middleware
app.use(async (req, res, next) => {
  if (req.oidc.isAuthenticated()) {
    // Store user info in session if not already present
    if (!req.session.user) {
      const user = {
        id: req.oidc.user.sub,
        email: req.oidc.user.email,
        name: req.oidc.user.name,
        picture: req.oidc.user.picture,
      };

      // Check if user exists in JSONbin storage
      try {
        const userData = await getUserData(user.id);
        if (userData) {
          // User exists, update session with JSONbin data
          req.session.user = { ...user, ...userData };
        } else {
          // New user, create record in JSONbin
          await createUserData(user);
          req.session.user = user;
        }
      } catch (error) {
        console.error("Error syncing user data with JSONbin:", error);
        req.session.user = user;
      }
    }

    // Make user data available to templates
    res.locals.user = req.session.user;
    res.locals.isAuthenticated = true;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
});

// Parse JSON requests
app.use(express.json());

// Helper functions for JSONbin integration
async function getUserData(userId) {
  try {
    const response = await axios.get(
      `${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}/latest`,
      {
        headers: {
          "X-Master-Key": jsonbinConfig.accessKey,
        },
      },
    );

    const users = response.data.record.users || [];
    return users.find((user) => user.id === userId);
  } catch (error) {
    console.error("Error fetching user data from JSONbin:", error);
    return null;
  }
}

async function createUserData(user) {
  try {
    // First get current data
    const response = await axios.get(
      `${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}/latest`,
      {
        headers: {
          "X-Master-Key": jsonbinConfig.accessKey,
        },
      },
    );

    const data = response.data.record || { users: [] };

    // Add new user
    if (!data.users) data.users = [];
    data.users.push({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString(),
      settings: {},
      data: {},
    });

    // Update JSONbin
    await axios.put(`${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}`, data, {
      headers: {
        "X-Master-Key": jsonbinConfig.accessKey,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating user data in JSONbin:", error);
  }
}

// User data API endpoints
app.get("/api/user", (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json(req.session.user);
});

app.post("/api/user/settings", async (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    // Get current data from JSONbin
    const response = await axios.get(
      `${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}/latest`,
      {
        headers: {
          "X-Master-Key": jsonbinConfig.accessKey,
        },
      },
    );

    const data = response.data.record;
    const userIndex = data.users.findIndex(
      (user) => user.id === req.session.user.id,
    );

    if (userIndex !== -1) {
      // Update user settings
      data.users[userIndex].settings = {
        ...data.users[userIndex].settings,
        ...req.body,
      };

      // Update JSONbin
      await axios.put(
        `${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}`,
        data,
        {
          headers: {
            "X-Master-Key": jsonbinConfig.accessKey,
            "Content-Type": "application/json",
          },
        },
      );

      // Update session
      req.session.user.settings = data.users[userIndex].settings;

      res.json({ success: true, settings: data.users[userIndex].settings });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// Protected routes middleware
const requireAuth = (req, res, next) => {
  if (!req.oidc.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};

// Example of a protected route
app.get("/profile", requireAuth, (req, res) => {
  const filePath = path.join(process.cwd(), "public/profile/index.html");

  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return res.status(500).send("Error loading profile page");
      }

      res.send(data);
    });
  } else {
    res.send(`
      <h1>Profile</h1>
      <p>Welcome ${req.session.user.name}</p>
      <img src="${req.session.user.picture}" alt="Profile" style="width: 100px; border-radius: 50%;">
      <p>Email: ${req.session.user.email}</p>
      <a href="/logout">Logout</a>
    `);
  }
});

// Existing code below this line
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

      // Add user data to the HTML if authenticated
      if (req.oidc.isAuthenticated()) {
        modifiedData = modifiedData.replace(
          "</head>",
          `<script>
            window.currentUser = ${JSON.stringify(req.session.user)};
            window.isAuthenticated = true;
          </script>
          </head>`,
        );
      } else {
        modifiedData = modifiedData.replace(
          "</head>",
          `<script>
            window.isAuthenticated = false;
          </script>
          </head>`,
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

// Serve static files after processing
app.use(express.static(path.join(process.cwd(), "public")));

// Handle custom redirects
app.get("/tango", (req, res) => {
  res.redirect("/tangini");
});

// Handle 404 errors (relative paths still apply here)
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

// Export for Vercel
module.exports = app;

// Start server locally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
