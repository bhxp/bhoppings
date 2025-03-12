// auth.js - Authentication module for Node.js
const axios = require("axios");
const crypto = require("crypto");
const session = require("express-session");
const connectRedis = require("connect-redis");
const { createClient } = require("redis");

// Get the RedisStore class from connectRedis
const RedisStore = connectRedis.RedisStore;

// Configuration (you should set these as environment variables in production)
const JSONBIN_API_KEY =
  process.env.JSONBIN_API_KEY ||
  "$2a$10$PdE8DlpdPuENmEfETNioOOROSZ8bMS7wVMiNa7YN415QGW907Fwwm";
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || "67d102208561e97a50ea4bb9";
const SESSION_SECRET = process.env.SESSION_SECRET || "1";
const REDIS_URL =
  process.env.REDIS_URL ||
  "rediss://default:Ae_bAAIjcDE3NTNkYTk0MjA5ZjE0NTk0YmRjODgwZjRiNzZmOWRhYnAxMA@amazed-emu-61403.upstash.io:6379";

// In-memory cache of users (in production, consider using Redis)
let usersCache = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Redis client
let redisClient;

// Hash password for secure storage
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Fetch users from JSONBin
async function fetchUsers() {
  const currentTime = Date.now();

  // Use cache if available and not expired
  if (usersCache && currentTime - lastFetchTime < CACHE_TTL) {
    return usersCache;
  }

  try {
    const response = await axios.get(
      `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
      {
        headers: {
          "X-Master-Key": JSONBIN_API_KEY,
        },
      },
    );

    usersCache = response.data.record || {};
    lastFetchTime = currentTime;
    return usersCache;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    // If we can't fetch, return cached data or empty object
    return usersCache || {};
  }
}

// Save users to JSONBin
async function saveUsers(users) {
  try {
    await axios.put(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, users, {
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
      },
    });

    // Update cache
    usersCache = users;
    lastFetchTime = Date.now();
    return true;
  } catch (error) {
    console.error("Error saving users:", error.message);
    return false;
  }
}

// Initialize the users bin if it doesn't exist
async function initializeUsersBin() {
  try {
    const users = await fetchUsers();
    // If bin is empty, initialize it
    if (Object.keys(users).length === 0) {
      await saveUsers({});
    }
  } catch (error) {
    console.error("Error initializing users bin:", error.message);
  }
}

// Initialize Redis client
async function initializeRedisClient() {
  try {
    redisClient = createClient({
      url: REDIS_URL,
    });

    redisClient.on("error", (error) => {
      console.error("Redis client error:", error);
    });

    await redisClient.connect();
    console.log("Connected to Redis successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    return false;
  }
}

// Auth module API
const auth = {
  // Setup auth routes and middleware
  setup: async function (app) {
    // Initialize Redis
    redisClient = createClient({
      url: REDIS_URL,
    });

    redisClient.on("error", (error) => {
      console.error("Redis client error:", error);
    });

    await redisClient.connect();
    console.log("Connected to Redis successfully");

    // Initialize session middleware with Redis store
    app.use(
      session({
        store: new RedisStore({ client: redisClient }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "lax",
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      }),
    );

    // Initialize users bin
    await initializeUsersBin();

    // Login processing route
    app.post("/login_process", async (req, res) => {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      try {
        const users = await fetchUsers();
        const user = users[username];

        if (!user || user.password !== hashPassword(password)) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid username or password" });
        }

        // Store user in session (omit password)
        req.session.user = {
          username,
          data: user.data,
        };

        return res.json({ success: true, redirectTo: "/" });
      } catch (error) {
        console.error("Login error:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    });

    // Signup processing route
    app.post("/signup_process", async (req, res) => {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required",
        });
      }

      // Add validation rules as needed (username format, password strength)
      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }

      try {
        const users = await fetchUsers();

        // Check if user already exists
        if (users[username]) {
          return res
            .status(409)
            .json({ success: false, message: "Username already taken" });
        }

        // Create new user with default data
        const newUser = {
          password: hashPassword(password),
          data: { createdAt: new Date().toISOString() },
        };

        // Save new user
        users[username] = newUser;
        await saveUsers(users);

        // Store user in session (omit password)
        req.session.user = {
          username,
          data: newUser.data,
        };

        return res.json({ success: true, redirectTo: "/" });
      } catch (error) {
        console.error("Signup error:", error.message);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }
    });

    // Logout route
    app.get("/logout", (req, res) => {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
        res.redirect("/login");
      });
    });

    // Return current user info
    app.get("/api/me", (req, res) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ authenticated: false });
      }

      return res.json({
        authenticated: true,
        username: req.session.user.username,
        data: req.session.user.data,
      });
    });
  },

  // Add a user
  addUser: async function (username, password, data = {}) {
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const users = await fetchUsers();

    // Check if user already exists
    if (users[username]) {
      throw new Error("Username already exists");
    }

    // Create new user
    users[username] = {
      password: hashPassword(password),
      data: data,
    };

    // Save users
    await saveUsers(users);
    return true;
  },

  // Remove a user
  removeUser: async function (username) {
    const users = await fetchUsers();

    // Check if user exists
    if (!users[username]) {
      throw new Error("User not found");
    }

    // Remove user
    delete users[username];

    // Save users
    await saveUsers(users);
    return true;
  },

  // Get user data
  getUserData: async function (username) {
    const users = await fetchUsers();

    // Check if user exists
    if (!users[username]) {
      throw new Error("User not found");
    }

    return users[username].data;
  },

  // Update user data
  updateUserData: async function (username, data) {
    const users = await fetchUsers();

    // Check if user exists
    if (!users[username]) {
      throw new Error("User not found");
    }

    // Update user data
    users[username].data = data;

    // Save users
    await saveUsers(users);
    return true;
  },

  // Check if user is authenticated (for middleware)
  isAuthenticated: function (req) {
    return req.session && req.session.user;
  },
};

module.exports = auth;
