const express = require("express");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const { auth } = require("express-openid-connect");
const axios = require("axios");
const MongoStore = require("connect-mongo");
const app = express();

// Parse JSON requests
app.use(express.json());

// Set up session before auth middleware
app.use(
  session({
    secret: "another-long-random-string-for-testing-only",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
    store: new (require("memorystore")(session))({
      checkPeriod: 86400000, // prune expired entries every 24h
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

// Set up Auth0 BEFORE defining protected routes
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
      scope: "openid profile email read:users update:users",
    },
  };

  auth(config)(req, res, next);
});

// Initialize the Auth0 Management API client
// You should add these as environment variables in production
const { ManagementClient } = require("auth0");
const auth0Management = new ManagementClient({
  domain: "dev-cnsg5vep82aj6nfp.us.auth0.com",
  clientId: "DPG9wJiWT1KtMiIAKQD3vg2sRXym2hx5",
  clientSecret:
    "a-l_TGZp9jOoGudNvgqgcm1q5cQvLRZIOQQomWZIeDEB-3NBn6Q-iVAl8gCKpxIp",
  scope: "read:users update:users",
});

// Protected routes middleware - AFTER Auth0 middleware is set up
const requireAuth = (req, res, next) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};

// User session middleware - Make sure user data is stored in session
app.use((req, res, next) => {
  if (req.oidc && req.oidc.isAuthenticated() && req.oidc.user) {
    // Store user info in session if not already there
    if (!req.session.user) {
      req.session.user = {
        id: req.oidc.user.sub,
        name: req.oidc.user.name,
        email: req.oidc.user.email,
        picture: req.oidc.user.picture,
      };
    }
  }
  next();
});

// Logout route - BEFORE protected routes
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

// JSONbin configuration - Hardcoded for testing (consider using environment variables in production)
const jsonbinConfig = {
  accessKey: "$2a$10$PdE8DlpdPuENmEfETNioOOROSZ8bMS7wVMiNa7YN415QGW907Fwwm",
  binId: "67d102208561e97a50ea4bb9",
  baseUrl: "https://api.jsonbin.io/v3",
};

// Update the getUserFromJsonbin function to handle missing data
async function getUserFromJsonbin(userId) {
  try {
    const response = await axios.get(
      `${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}/latest`,
      {
        headers: {
          "X-Master-Key": jsonbinConfig.accessKey,
        },
      },
    );

    // Get the data from response, or initialize with empty users array if missing
    const data = response.data.record || { users: [] };

    // Make sure users array exists
    if (!data.users) {
      data.users = [];
    }

    return {
      data,
      user: data.users.find((user) => user.id === userId),
      userIndex: data.users.findIndex((user) => user.id === userId),
    };
  } catch (error) {
    console.error("Error fetching data from JSONbin:", error);
    // Return a default structure instead of throwing
    return {
      data: { users: [] },
      user: null,
      userIndex: -1,
    };
  }
}

// Helper function to update user data in JSONbin
async function updateJsonbin(data) {
  try {
    await axios.put(`${jsonbinConfig.baseUrl}/b/${jsonbinConfig.binId}`, data, {
      headers: {
        "X-Master-Key": jsonbinConfig.accessKey,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating data in JSONbin:", error);
    throw new Error("Failed to update user data");
  }
}

// Create or update user in JSONbin (called during auth process)
async function createOrUpdateUserData(user) {
  try {
    // Get current data
    let { data, userIndex } = await getUserFromJsonbin(user.id);

    // If data doesn't exist yet, initialize it
    if (!data) {
      data = { users: [] };
    }

    // If users array doesn't exist, initialize it
    if (!data.users) {
      data.users = [];
      userIndex = -1;
    }

    if (userIndex !== -1) {
      // Update existing user
      data.users[userIndex] = {
        ...data.users[userIndex],
        email: user.email,
        name: user.name,
        lastLogin: new Date().toISOString(),
      };
    } else {
      // Add new user
      data.users.push({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        settings: {},
        metadata: {},
        data: {},
      });
    }

    // Update JSONbin
    await updateJsonbin(data);
    return userIndex !== -1
      ? data.users[userIndex]
      : data.users[data.users.length - 1];
  } catch (error) {
    console.error("Error creating/updating user data in JSONbin:", error);
    throw new Error("Failed to create/update user");
  }
}

// Get all user metadata
app.get("/api/user/metadata", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { user } = await getUserFromJsonbin(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      metadata: user.metadata || {},
    });
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    res.status(500).json({ error: "Failed to fetch user metadata" });
  }
});

// Update a single metadata key
app.post("/api/user/metadata/:key", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const key = req.params.key;
    const value = req.body.value;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure metadata object exists
    if (!data.users[userIndex].metadata) {
      data.users[userIndex].metadata = {};
    }

    // Update the metadata
    data.users[userIndex].metadata[key] = value;

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      key,
      value,
      metadata: data.users[userIndex].metadata,
    });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    res.status(500).json({ error: "Failed to update metadata" });
  }
});

// Delete a single metadata key
app.delete("/api/user/metadata/:key", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const key = req.params.key;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (
      userIndex === -1 ||
      !data.users[userIndex].metadata ||
      data.users[userIndex].metadata[key] === undefined
    ) {
      return res.status(404).json({ error: "User or metadata key not found" });
    }

    // Delete the key
    delete data.users[userIndex].metadata[key];

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      metadata: data.users[userIndex].metadata,
    });
  } catch (error) {
    console.error("Error deleting metadata key:", error);
    res.status(500).json({ error: "Failed to delete metadata key" });
  }
});

// Reset all user metadata
app.delete("/api/user/metadata", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Reset metadata to empty object
    data.users[userIndex].metadata = {};

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      metadata: {},
    });
  } catch (error) {
    console.error("Error resetting user metadata:", error);
    res.status(500).json({ error: "Failed to reset metadata" });
  }
});
// User data API endpoints
app.get("/api/user", requireAuth, (req, res) => {
  res.json(req.session.user);
});

// Get all user data
app.get("/api/user/data", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { user } = await getUserFromJsonbin(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      data: user.data || {},
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

// Update a single data key
app.post("/api/user/data/:key", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const key = req.params.key;
    const value = req.body.value;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure data object exists
    if (!data.users[userIndex].data) {
      data.users[userIndex].data = {};
    }

    // Update the data
    data.users[userIndex].data[key] = value;

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      key,
      value,
      data: data.users[userIndex].data,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Update multiple data keys at once
app.put("/api/user/data", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const updates = req.body; // This should be an object with key-value pairs

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ error: "Invalid data format" });
    }

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure data object exists
    if (!data.users[userIndex].data) {
      data.users[userIndex].data = {};
    }

    // Update multiple keys
    data.users[userIndex].data = {
      ...data.users[userIndex].data,
      ...updates,
    };

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      data: data.users[userIndex].data,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Delete a single data key
app.delete("/api/user/data/:key", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const key = req.params.key;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (
      userIndex === -1 ||
      !data.users[userIndex].data ||
      data.users[userIndex].data[key] === undefined
    ) {
      return res.status(404).json({ error: "User or data key not found" });
    }

    // Delete the key
    delete data.users[userIndex].data[key];

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      data: data.users[userIndex].data,
    });
  } catch (error) {
    console.error("Error deleting data key:", error);
    res.status(500).json({ error: "Failed to delete data key" });
  }
});

// Reset all user data
app.delete("/api/user/data", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const { data, userIndex } = await getUserFromJsonbin(userId);

    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Reset data to empty object
    data.users[userIndex].data = {};

    // Update JSONbin
    await updateJsonbin(data);

    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Error resetting user data:", error);
    res.status(500).json({ error: "Failed to reset data" });
  }
});

app.post("/api/user/settings", requireAuth, async (req, res) => {
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

// Profile route - Protected
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

// Static file handling
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
      const hasPreloadTags = preloadTagRegex.test(data);
      // Reset the RegExp lastIndex to start from the beginning again
      preloadTagRegex.lastIndex = 0;

      if (hasPreloadTags) {
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
      if (req.oidc && req.oidc.isAuthenticated()) {
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

// Global error handler
app.use((err, req, res, next) => {
  console.error("Application error:", err);
  res.status(500).send("Something went wrong");
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
