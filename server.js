const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const fsSync = require("fs");
const session = require("express-session");
const { auth } = require("express-openid-connect");
const { ManagementClient } = require("auth0");
const createRedirects = require("./redirects.js");

console.log('Starting server initialization...');
console.log('Environment details:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  FLY_APP_NAME: process.env.FLY_APP_NAME,
  FLY_REGION: process.env.FLY_REGION
});

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
    // Use a more efficient session store for Vercel
    store: new (require("memorystore")(session))({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  }),
);

// Lazy-load Auth0 Management client only when needed
const getAuth0ManagementClient = (() => {
  let auth0Client = null;
  return () => {
    if (!auth0Client) {
      auth0Client = new ManagementClient({
        domain: "dev-cnsg5vep82aj6nfp.us.auth0.com",
        clientId: "DPG9wJiWT1KtMiIAKQD3vg2sRXym2hx5",
        clientSecret:
          "a-l_TGZp9jOoGudNvgqgcm1q5cQvLRZIOQQomWZIeDEB-3NBn6Q-iVAl8gCKpxIp",
        scope: "read:users update:users",
      });
    }
    return auth0Client;
  };
})();

// Update the baseURL middleware to use HTTPS
app.use((req, res, next) => {
  // Store the original URL in the session for later redirects
  if (
    !req.session.returnTo &&
    req.originalUrl !== "/callback" &&
    !req.originalUrl.startsWith("/logout")
  ) {
    req.session.returnTo = req.originalUrl;
  }

  // Always use HTTPS for Vercel
  let protocol = "https";

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

// Protected routes middleware - AFTER Auth0 middleware is set up
const requireAuth = (req, res, next) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.redirect("/login");
  }
  next();
};

// Optimize user session middleware - only initialize on first login
app.use((req, res, next) => {
  if (req.oidc && req.oidc.isAuthenticated() && req.oidc.user) {
    // Store user info in session if not already there
    const userData = {
      id: req.oidc.user.sub,
      name: req.oidc.user.name,
      email: req.oidc.user.email,
      picture: req.oidc.user.picture,
    };

    // Only update basic user info in session
    req.session.user = userData;

    // Only initialize user metadata on first login
    if (req.url === "/callback" || !req.session.userInitialized) {
      req.session.userInitialized = true;
      // Don't await - run in background to not block response
      initializeUserData(userData.id).catch((error) => {
        console.error("Error initializing user data:", error);
      });
    }
  }
  next();
});

// NEW: Global middleware to inject user data into all HTML responses
// Place this early in the middleware chain
app.use((req, res, next) => {
  if (req.headers["accept"] && req.headers["accept"].includes("text/html")) {
    const originalSend = res.send;
    res.send = function (body) {
      if (typeof body === "string" && body.includes("</head>")) {
        let modifiedBody = body;

        // Only inject user data if not already present
        if (
          !modifiedBody.includes("window.currentUser") &&
          !modifiedBody.includes("window.isAuthenticated")
        ) {
          const userData =
            req.oidc && req.oidc.isAuthenticated()
              ? `<script>
                window.currentUser = ${JSON.stringify(req.session.user)};
                window.isAuthenticated = true;
              </script>`
              : `<script>window.isAuthenticated = false;</script>`;

          modifiedBody = modifiedBody.replace(
            "</head>",
            `${userData}\n</head>`,
          );
        }

        // Only inject user-data.js if not already present
        if (!modifiedBody.includes("/user-data.js")) {
          modifiedBody = modifiedBody.replace(
            "</head>",
            '<!-- Account Data Management Library injected by the server -->\n<script src="/user-data.js"></script>\n</head>',
          );
        }

        return originalSend.call(this, modifiedBody);
      }
      return originalSend.call(this, body);
    };
  }
  next();
});

// Logout route - BEFORE protected routes
app.get("/logout", (req, res) => {
  // Get the return URL before clearing session
  const returnTo = `${req.baseURL}/home`;

  // Clear local session
  req.session = null;

  // Redirect to Auth0 logout
  res.redirect(
    `https://dev-cnsg5vep82aj6nfp.us.auth0.com/v2/logout?client_id=DPG9wJiWT1KtMiIAKQD3vg2sRXym2hx5&returnTo=${returnTo}`,
  );
});

app.get("/signup", (req, res) => {
  // Store the original URL or home page as the return destination
  req.session.returnTo = req.session.returnTo || "/home";

  // Use the oidc.login method from the express-openid-connect library
  // This will handle proper state generation and validation
  return res.oidc.login({
    returnTo: req.session.returnTo,
    authorizationParams: {
      screen_hint: "signup",
      // Include the same scopes as in your main configuration
      scope: "openid profile email read:users update:users",
    },
  });
});

// Optimize: User data helpers with batching
// ---------------------

// Helper function to initialize user data in Auth0 - Only called on first login
async function initializeUserData(userId) {
  try {
    const auth0 = getAuth0ManagementClient();
    // Get current user data from Auth0
    const user = await auth0.getUser({ id: userId });

    // Check if we need to initialize the user
    if (!user.user_metadata) {
      // Initialize user metadata
      await auth0.updateUserMetadata(
        { id: userId },
        {
          settings: {},
          metadata: {},
          data: {},
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
      );
    } else {
      // Just update login time
      await auth0.updateUserMetadata(
        { id: userId },
        {
          ...user.user_metadata,
          lastLogin: new Date().toISOString(),
        },
      );
    }

    return user;
  } catch (error) {
    console.error("Error initializing user data in Auth0:", error);
    throw error;
  }
}

// Helper function to get user metadata from Auth0
async function getUserMetadata(userId) {
  try {
    const auth0 = getAuth0ManagementClient();
    const user = await auth0.getUser({ id: userId });
    return user.user_metadata || {};
  } catch (error) {
    console.error("Error fetching user metadata from Auth0:", error);
    throw error;
  }
}

// Helper function to update user metadata in Auth0
async function updateUserMetadata(userId, metadata) {
  try {
    const auth0 = getAuth0ManagementClient();
    await auth0.updateUserMetadata({ id: userId }, metadata);
    return metadata;
  } catch (error) {
    console.error("Error updating user metadata in Auth0:", error);
    throw error;
  }
}

// Optimized API Routes
// ---------------------

// Get all user metadata
app.get("/api/user/metadata", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const userMetadata = await getUserMetadata(userId);

    res.json({
      success: true,
      metadata: userMetadata.metadata || {},
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Ensure metadata object exists
    if (!userMetadata.metadata) {
      userMetadata.metadata = {};
    }

    // Update the metadata
    userMetadata.metadata[key] = value;

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    res.json({
      success: true,
      key,
      value,
      metadata: userMetadata.metadata,
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    if (!userMetadata.metadata || userMetadata.metadata[key] === undefined) {
      return res.status(404).json({ error: "User or metadata key not found" });
    }

    // Delete the key
    delete userMetadata.metadata[key];

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    res.json({
      success: true,
      metadata: userMetadata.metadata,
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Reset metadata to empty object
    userMetadata.metadata = {};

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

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
    const userMetadata = await getUserMetadata(userId);

    res.json({
      success: true,
      data: userMetadata.data || {},
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Ensure data object exists
    if (!userMetadata.data) {
      userMetadata.data = {};
    }

    // Update the data
    userMetadata.data[key] = value;

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    res.json({
      success: true,
      key,
      value,
      data: userMetadata.data,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Failed to update data" });
  }
});

// Update multiple data keys at once - THIS IS THE PREFERRED METHOD
app.put("/api/user/data", requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const updates = req.body; // This should be an object with key-value pairs

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Ensure data object exists
    if (!userMetadata.data) {
      userMetadata.data = {};
    }

    // Update multiple keys
    userMetadata.data = {
      ...userMetadata.data,
      ...updates,
    };

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    res.json({
      success: true,
      data: userMetadata.data,
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    if (!userMetadata.data || userMetadata.data[key] === undefined) {
      return res.status(404).json({ error: "User or data key not found" });
    }

    // Delete the key
    delete userMetadata.data[key];

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    res.json({
      success: true,
      data: userMetadata.data,
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

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Reset data to empty object
    userMetadata.data = {};

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

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
    const userId = req.session.user.id;

    // Get current metadata
    const userMetadata = await getUserMetadata(userId);

    // Ensure settings object exists
    if (!userMetadata.settings) {
      userMetadata.settings = {};
    }

    // Update settings
    userMetadata.settings = {
      ...userMetadata.settings,
      ...req.body,
    };

    // Update Auth0
    await updateUserMetadata(userId, userMetadata);

    // Update session
    req.session.user.settings = userMetadata.settings;

    res.json({
      success: true,
      settings: userMetadata.settings,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// UPDATED: Profile route - Protected - Now with direct user data injection
app.get("/profile", requireAuth, async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "public/profile/index.html");

    if (fsSync.existsSync(filePath)) {
      let data = await fs.readFile(filePath, "utf8");

      // Inject the user data directly into the HTML
      data = data.replace(
        "</head>",
        `<script>
          window.currentUser = ${JSON.stringify(req.session.user)};
          window.isAuthenticated = true;
        </script>
        </head>`,
      );

      res.send(data);
    } else {
      // For the dynamically generated HTML, include the script tag directly
      res.send(`
        <html>
        <head>
          <script>
            window.currentUser = ${JSON.stringify(req.session.user)};
            window.isAuthenticated = true;
          </script>
        </head>
        <body>
          <h1>Profile</h1>
          <p>Welcome ${req.session.user.name}</p>
          <img src="${req.session.user.picture}" alt="Profile" style="width: 100px; border-radius: 50%;">
          <p>Email: ${req.session.user.email}</p>
          <a href="/logout">Logout</a>
        </body>
        </html>
      `);
    }
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Error loading profile page");
  }
});

// Static file handling - Optimized for Vercel
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

    if (
      fsSync.existsSync(correctedPath) &&
      fsSync.statSync(correctedPath).isFile()
    ) {
      return res.sendFile(correctedPath);
    }
  } catch (err) {
    console.error("Error fixing relative paths:", err);
  }

  next();
};

app.use(fixRelativePaths);

// Optimize preload tag processing
// Create a cache for HTML files - compatible with serverless
const htmlCache = {};

// Async version of getFile
const getFile = async (baseDir, url, name) => {
  try {
    const normalizedUrl = url.startsWith("/") ? url.slice(1) : url;
    const filePath = path.join(process.cwd(), "public", baseDir, normalizedUrl);

    // Check if file exists
    try {
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) {
        console.error(`Not a file: ${filePath}`);
        return `<!-- Not a file: ${url} -->`;
      }
    } catch (err) {
      console.error(`File not found: ${filePath}`);
      return `<!-- File not found: ${url} -->`;
    }

    const data = await fs.readFile(filePath, "utf8");
    return `<preload name='${name}'>${data}</preload>`;
  } catch (err) {
    console.error(`Error reading file ${url}:`, err);
    return `<!-- Error reading file ${url} -->`;
  }
};

// Optimized preload tag processor
const processPreloadTags = async (req, res, next) => {
  let filePath = path.join(process.cwd(), "public", req.path);

  // Check if we need to append index.html
  try {
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch (err) {
    // File doesn't exist, let the next middleware handle it
    return next();
  }

  // Only process HTML files
  if (!filePath.endsWith(".html") || !fsSync.existsSync(filePath)) {
    return next();
  }

  try {
    // Check cache first (even in serverless this helps during a single request)
    let data;
    if (htmlCache[filePath]) {
      data = htmlCache[filePath];
    } else {
      data = await fs.readFile(filePath, "utf8");
      // Store in cache - useful even in serverless for repeated requests in development
      htmlCache[filePath] = data;
    }

    // <preload src="$URL"></preload>
    const preloadTagRegex =
      /<preload\s+name="([^"]+)"\s+src="([^"]+)"(?:\s*\/>|>\s*<\/preload>)/g;
    const baseDir = path.dirname(req.path).substring(1);

    // Check if there are any preload tags
    const hasPreloadTags = preloadTagRegex.test(data);
    preloadTagRegex.lastIndex = 0; // Reset regex

    let modifiedData = data;

    if (hasPreloadTags) {
      // Add preload script
      modifiedData = data.replace(
        `</body>`,
        `<!-- preload script injected by server software, ignore -->
        <script type="text/javascript" src="/preload.js"></script>
        </body>`,
      );

      // Process all preload tags
      const matches = [...modifiedData.matchAll(preloadTagRegex)];

      // Process all preloads in parallel
      const replacements = await Promise.all(
        matches.map(async ([match, name, url]) => {
          const content = await getFile(baseDir, url, name);
          return { match, content };
        }),
      );

      // Apply replacements
      for (const { match, content } of replacements) {
        modifiedData = modifiedData.replace(match, content);
      }
    }

    // Add user data to the HTML if authenticated - THIS CODE IS KEPT FOR BACKWARDS COMPATIBILITY
    // The global middleware should handle this now, but keeping this as a fallback
    if (req.oidc && req.oidc.isAuthenticated()) {
      if (!modifiedData.includes("window.currentUser")) {
        // Only inject if not already injected
        modifiedData = modifiedData.replace(
          "</head>",
          `<script>
            window.currentUser = ${JSON.stringify(req.session.user)};
            window.isAuthenticated = true;
          </script>
          </head>`,
        );
      }
    } else {
      if (!modifiedData.includes("window.isAuthenticated")) {
        // Only inject if not already injected
        modifiedData = modifiedData.replace(
          "</head>",
          `<script>
            window.isAuthenticated = false;
          </script>
          </head>`,
        );
      }
    }

    res.set("Content-Type", "text/html");
    res.send(modifiedData);
  } catch (err) {
    console.error("Error processing HTML:", err);
    next(err);
  }
};

// UPDATED: This middleware was moved from a separate lower position to HERE
// to make it take precedence for all HTML responses
app.use((req, res, next) => {
  if (req.headers["accept"] && req.headers["accept"].includes("text/html")) {
    const originalSend = res.send;
    res.send = (body) => {
      if (typeof body === "string" && body.includes("</head>")) {
        // Add user-data.js script before </head>

        // Ensure user data is injected if not already present
        if (
          req.oidc &&
          req.oidc.isAuthenticated() &&
          !body.includes("window.currentUser")
        ) {
          body = body.replace(
            "</head>",
            `<script>
              window.currentUser = ${JSON.stringify(req.session.user)};
              window.isAuthenticated = true;
            </script>
            </head>`,
          );
        } else if (!body.includes("window.isAuthenticated")) {
          body = body.replace(
            "</head>",
            `<script>
              window.isAuthenticated = false;
            </script>
            </head>`,
          );
        }
        if (!body.includes("/user-data.js")) {
          body = body.replace(
            "</head>",
            '<!-- Account Data Management Library injected by the server -->\n<script src="/user-data.js"></script>\n</head>',
          );
        }
      }

      originalSend.call(res, body);
    };
  }
  next();
});

// Use the async middleware
app.use((req, res, next) => {
  processPreloadTags(req, res, next).catch(next);
});

app.get("/app-icon", (req, res, next) => {
  const filePath = path.join(__dirname, "public", "ai/app-icon/index.html");
  res.sendFile(filePath, (err) => {
    if (err) {
      next(err);
    }
  });
});
// Define your key-value pairs
const redirects = {
  tango: "/archived/tangini",
  tangini: "/archived/tangini",
};

// Get middleware functions
const redirectMiddlewares = createRedirects(redirects);

// Set up each redirect route
Object.keys(redirectMiddlewares).forEach((key) => {
  app.use(`/${key}`, redirectMiddlewares[key]);
});

// Serve static files after processing
app.use(express.static(path.join(process.cwd(), "public")));

// Handle 404 errors (relative paths still apply here)
app.use(async (req, res) => {
  try {
    let filePath = path.join(process.cwd(), "public/404/index.html");
    const data = await fs.readFile(filePath, "utf8");

    // Process preload tags in 404 page
    const preloadTagRegex = /<preload\s+name="([^"]+)"\s+src="([^"]+)"\s*\/>/g;
    const matches = [...data.matchAll(preloadTagRegex)];

    let modifiedData = data;

    // Process all preloads in parallel
    const replacements = await Promise.all(
      matches.map(async ([match, name, url]) => {
        const content = await getFile("404", url, name);
        return { match, content };
      }),
    );

    // Apply replacements
    for (const { match, content } of replacements) {
      modifiedData = modifiedData.replace(match, content);
    }

    res.status(404).send(modifiedData);
  } catch (err) {
    console.error("Error serving 404 page:", err);
    res.status(404).send("404 Not Found");
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Application error:", err);
  res.status(500).send("Something went wrong");
});

// Add proper signal handling
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Keep track of the server instance
let server = null;

// Export for Vercel
module.exports = app;

// Only start the server if this file is directly executed (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  console.log(`Attempting to start server on port ${PORT}`);
  
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully running at http://0.0.0.0:${PORT}`);
  });
  
  // Add error handling for the server
  server.on('error', (error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}
