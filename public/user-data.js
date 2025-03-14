/**
 * UserAccount.js - Client library for user account management with synchronous methods
 *
 * This library provides synchronous methods to interact with user data stored in JSONbin
 * through the server API endpoints, with localStorage fallback for unauthenticated users.
 */

class UserAccount {
    /**
     * Create a new UserAccount instance
     * @param {Object} options - Configuration options
     * @param {string} options.baseUrl - Base URL for API requests (defaults to current origin)
     * @param {string} options.localStoragePrefix - Prefix for localStorage keys (defaults to 'userAccount_')
     */
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || window.location.origin;
        this.localStoragePrefix = options.localStoragePrefix || "userAccount_";
        this.userData = null;
        this.metadataCache = null;
        this.profileCache = null;
        this.isAuthenticated = window.isAuthenticated;
        this.authError = new Error("User is not authenticated");
        this.authError.code = "UNAUTHENTICATED";
        this.usingLocalStorage = !window.isAuthenticated;
        this.clearData = this.resetData;

        // Initialize data immediately
        this._initializeData();

        this.defaultData = {
            theme: {
                primary: "#fff",
                "dark-background": "#12151c",
                cursor1: "#3AC4FF",
                cursor2: "#3AC4FF",
                color1: "#D185FF",
                color2: "#0ff",
                bg1: "#669",
                bg2: "#669",
            },
            debug: {
                disableCursor: false,
            },
            effect: 0,
            myValue: true,
        };
        this.mergeWithDefaults();
    }

    /**
     * Sets the entire user data object
     * @param {Object} data - Complete data object to set
     * @returns {Object} Updated data object
     */
    setData(data) {
        // Update the local cache immediately
        this.userData = data;

        // If not authenticated, use localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background save
            this._apiRequest("/api/user/data", {
                method: "PUT",
                body: data,
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        }

        return this;
    }

    /**
     * Deletes all user data and resets to an empty object
     * @returns {Object} Empty user data object
     */
    deleteData() {
        // Reset to empty object
        this.userData = {};

        // If not authenticated, use localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background delete
            this._apiRequest("/api/user/data", {
                method: "DELETE",
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        }

        return this;
    }

    /**
     * Resets user data to default values
     * @returns {Object} Default user data object
     */
    reset() {
        // Clone the default data to avoid modifying the original
        const defaultData = JSON.parse(JSON.stringify(this.defaultData));

        // Set the user data to the default data
        this.setData(defaultData);

        return this;
    }

    /**
     * Merges default values into the current user data
     * @returns {Object} Updated user data object
     */
    mergeWithDefaults() {
        const currentData = this.getData();
        let dataChanged = false;

        /**
         * Recursively merges default values into the current data object
         * @param {Object} target - The target object to modify
         * @param {Object} defaults - The default values to merge in
         * @returns {boolean} Whether any changes were made
         */
        const deepMerge = (target, defaults) => {
            let changed = false;

            for (const key in defaults) {
                if (!Object.prototype.hasOwnProperty.call(defaults, key))
                    continue;

                // If key doesn't exist in target, add it
                if (!(key in target)) {
                    target[key] = defaults[key];
                    changed = true;
                }
                // If both are objects, recursively merge
                else if (
                    typeof defaults[key] === "object" &&
                    defaults[key] !== null &&
                    !Array.isArray(defaults[key]) &&
                    typeof target[key] === "object" &&
                    target[key] !== null &&
                    !Array.isArray(target[key])
                ) {
                    // Recursively merge nested objects
                    const nestedChanged = deepMerge(target[key], defaults[key]);
                    if (nestedChanged) changed = true;
                }
                // Otherwise existing value takes precedence
            }

            return changed;
        };

        // Perform the deep merge
        dataChanged = deepMerge(currentData, this.defaultData);

        // Only update if something changed
        if (dataChanged) {
            this.setData(currentData);
        }

        return this;
    }

    /**
     * Initialize all data synchronously on startup
     * @private
     */
    _initializeData() {
        // For unauthenticated users, load from localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this.userData = this._getFromLocalStorage("userData") || {};
            this.metadataCache = this._getFromLocalStorage("metadata") || {};
            this.profileCache = this._getFromLocalStorage("profile") || {
                username: "guest",
                displayName: "Guest User",
                isGuest: true,
            };
        } else {
            // For authenticated users, start background fetch but initialize with empty data
            this.userData = {};
            this.metadataCache = {};
            this.profileCache = {};

            // Start background loading of data
            this._backgroundLoadData();
        }
    }

    /**
     * Background load all user data
     * @private
     */
    _backgroundLoadData() {
        if (window.isAuthenticated && !this.usingLocalStorage) {
            // Load all data in the background without waiting
            this._apiRequest("/api/user/data")
                .then((response) => {
                    this.userData = response.data || {};
                })
                .catch((error) => {
                    if (error.code === "UNAUTHENTICATED") {
                        this._warnUnauthenticated();
                        this.userData =
                            this._getFromLocalStorage("userData") || {};
                    }
                });

            this._apiRequest("/api/user")
                .then((response) => {
                    this.profileCache = response;
                })
                .catch(() => {
                    this.profileCache = this._getFromLocalStorage(
                        "profile",
                    ) || {
                        username: "guest",
                        displayName: "Guest User",
                        isGuest: true,
                    };
                });

            this._apiRequest("/api/user/metadata")
                .then((response) => {
                    this.metadataCache = response.metadata || {};
                })
                .catch(() => {
                    this.metadataCache =
                        this._getFromLocalStorage("metadata") || {};
                });
        }
    }

    /**
     * Makes an API request (remains async for internal use)
     * @private
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {boolean} requireAuth - Whether this endpoint requires authentication
     * @returns {Promise<Object>} Response data
     */
    async _apiRequest(endpoint, options = {}, requireAuth = true) {
        // Check authentication if required
        if (requireAuth && !window.isAuthenticated) {
            this._warnUnauthenticated();
            // Instead of throwing error, we'll switch to localStorage mode
            this.usingLocalStorage = true;
            throw this.authError;
        }

        const url = `${this.baseUrl}${endpoint}`;

        // Default options
        const defaultOptions = {
            credentials: "include", // Include cookies for session authentication
            headers: {
                "Content-Type": "application/json",
            },
        };

        // Merge options
        const fetchOptions = { ...defaultOptions, ...options };

        // If we're sending data, stringify it
        if (fetchOptions.body && typeof fetchOptions.body === "object") {
            fetchOptions.body = JSON.stringify(fetchOptions.body);
        }

        try {
            const response = await fetch(url, fetchOptions);

            // Handle non-2xx responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                // Handle authentication errors from server
                if (response.status === 401) {
                    window.isAuthenticated = false;
                    this.usingLocalStorage = true;
                    this._warnUnauthenticated();
                    throw this.authError;
                }

                throw new Error(
                    errorData?.error ||
                        `API request failed with status ${response.status}`,
                );
            }

            return await response.json();
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    /**
     * Log warning about unauthenticated use
     * @private
     */
    _warnUnauthenticated() {
        console.warn(
            "You are not signed in. If you are developing without an account, ignore this message. If this is unexpected, it may be a bug. If you are supposed to be making of an account, please sign in. Using localStorage as a fallback for data storage.",
        );
    }

    /**
     * Gets a value from localStorage
     * @private
     * @param {string} key - The key to retrieve
     * @returns {any} The stored value (or null if not found)
     */
    _getFromLocalStorage(key) {
        try {
            const value = localStorage.getItem(
                `${this.localStoragePrefix}${key}`,
            );
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error("Error reading from localStorage:", error);
            return null;
        }
    }

    /**
     * Sets a value in localStorage
     * @private
     * @param {string} key - The key to set
     * @param {any} value - The value to store
     */
    _setInLocalStorage(key, value) {
        try {
            localStorage.setItem(
                `${this.localStoragePrefix}${key}`,
                JSON.stringify(value),
            );
        } catch (error) {
            console.error("Error writing to localStorage:", error);
        }
    }

    /**
     * Removes a value from localStorage
     * @private
     * @param {string} key - The key to remove
     */
    _removeFromLocalStorage(key) {
        try {
            localStorage.removeItem(`${this.localStoragePrefix}${key}`);
        } catch (error) {
            console.error("Error removing from localStorage:", error);
        }
    }

    /**
     * Clear all localStorage data for this account
     * @private
     */
    _clearLocalStorage() {
        try {
            const keysToRemove = [];

            // Find all keys with our prefix
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this.localStoragePrefix)) {
                    keysToRemove.push(key);
                }
            }

            // Remove the keys
            keysToRemove.forEach((key) => localStorage.removeItem(key));
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    }

    /**
     * Check if the user is currently logged in
     * @returns {boolean} Login status
     */
    isLoggedIn() {
        return window.isAuthenticated;
    }

    /**
     * Log the user out by redirecting to the logout page
     */
    logout() {
        window.localStorage.clear();
        window.localStorage.setItem("bioReferer", window.location.pathname);
        window.open("/logout", "_self");
    }

    login() {
        window.localStorage.clear();
        window.localStorage.setItem("bioReferer", window.location.pathname);
        window.open("/login", "_self");
    }

    /**
     * Synchronously get all user data
     * @returns {Object} User data object
     */
    getData() {
        // If we haven't loaded the data yet, it should be initialized with defaults
        // from the constructor to avoid returning null
        return this.userData;
    }

    /**
     * Synchronously set a single data value with support for paths
     * @param {string|Array} path - The data path to update (e.g. 'settings.theme.primary' or ['settings', 'theme', 'primary'])
     * @param {any} value - The new value
     * @returns {Object} Updated data object
     */
    setValue(path, value) {
        // Convert string path to array (e.g., 'settings.theme.primary' => ['settings', 'theme', 'primary'])
        const pathArray = Array.isArray(path) ? path : path.split(".");

        // Simple case: top-level property
        if (pathArray.length === 1) {
            this.userData[pathArray[0]] = value;
        } else {
            // Complex case: nested property
            let current = this.userData;

            // Navigate to the parent object of the property we want to set
            for (let i = 0; i < pathArray.length - 1; i++) {
                const key = pathArray[i];

                // Create empty objects for missing parts of the path
                if (current[key] === undefined || current[key] === null) {
                    current[key] = {};
                }
                current = current[key];
            }

            // Set the value on the final property
            current[pathArray[pathArray.length - 1]] = value;
        }

        // If not authenticated, use localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background save
            this._backgroundSaveValue(path, value);
        }

        return this;
    }

    /**
     * Background save for setValue
     * @private
     * @param {string|Array} path - The data path to update
     * @param {any} value - The new value
     */
    _backgroundSaveValue(path, value) {
        // Convert path to array if it's a string
        const pathArray = Array.isArray(path) ? path : path.split(".");

        // If it's a simple top-level property, use the existing API endpoint
        if (pathArray.length === 1) {
            this._apiRequest(`/api/user/data/${pathArray[0]}`, {
                method: "POST",
                body: { value },
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        } else {
            // For nested properties, we need to use the full data update endpoint
            // Create the nested structure to update
            let update = {};
            let current = update;

            // Build the nested object structure
            for (let i = 0; i < pathArray.length - 1; i++) {
                current[pathArray[i]] = {};
                current = current[pathArray[i]];
            }

            // Set the final value
            current[pathArray[pathArray.length - 1]] = value;

            // Send the update
            this._apiRequest("/api/user/data", {
                method: "PUT",
                body: update,
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        }
    }

    /**
     * Synchronously get a value using a path
     * @param {string|Array} path - The data path to retrieve (e.g. 'settings.theme.primary' or ['settings', 'theme', 'primary'])
     * @param {any} defaultValue - Optional default value if path doesn't exist
     * @returns {any} The value at the specified path (or defaultValue if not found)
     */
    getValue(path, defaultValue = undefined) {
        // Handle simple case where path is a direct key
        if (!path || (typeof path === "string" && !path.includes("."))) {
            return this.userData[path] !== undefined
                ? this.userData[path]
                : defaultValue;
        }

        // Convert string path to array
        const pathArray = Array.isArray(path) ? path : path.split(".");

        // Traverse the object following the path
        let current = this.userData;
        for (let i = 0; i < pathArray.length; i++) {
            if (current === undefined || current === null) {
                return defaultValue;
            }
            current = current[pathArray[i]];
        }

        return current !== undefined ? current : defaultValue;
    }

    /**
     * Synchronously delete a value using a path
     * @param {string|Array} path - The data path to delete (e.g. 'settings.theme.primary' or ['settings', 'theme', 'primary'])
     * @returns {Object} Updated data object
     */
    deleteValue(path) {
        // Convert string path to array
        const pathArray = Array.isArray(path) ? path : path.split(".");

        // Simple case: top-level property
        if (pathArray.length === 1) {
            delete this.userData[pathArray[0]];
        } else {
            // Complex case: nested property
            let current = this.userData;

            // Navigate to the parent object of the property we want to delete
            for (let i = 0; i < pathArray.length - 1; i++) {
                const key = pathArray[i];

                // If any part of the path doesn't exist, we're done
                if (current[key] === undefined || current[key] === null) {
                    return this;
                }
                current = current[key];
            }

            // Delete the final property
            delete current[pathArray[pathArray.length - 1]];
        }

        // If not authenticated, use localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background delete
            this._backgroundDeleteValue(path);
        }

        return this;
    }

    /**
     * Background delete for deleteValue
     * @private
     * @param {string|Array} path - The data path to delete
     */
    _backgroundDeleteValue(path) {
        // Convert path to array if it's a string
        const pathArray = Array.isArray(path) ? path : path.split(".");

        // If it's a simple top-level property, use the existing API endpoint
        if (pathArray.length === 1) {
            this._apiRequest(`/api/user/data/${pathArray[0]}`, {
                method: "DELETE",
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        } else {
            // For nested properties, we need a different approach
            // Create a deep copy of the data without the path we're deleting
            const newData = JSON.parse(JSON.stringify(this.userData));
            let current = newData;

            // Navigate to the parent object
            for (let i = 0; i < pathArray.length - 1; i++) {
                if (!current[pathArray[i]]) break;
                current = current[pathArray[i]];
            }

            // Delete the property
            delete current[pathArray[pathArray.length - 1]];

            // Send the full update
            this._apiRequest("/api/user/data", {
                method: "PUT",
                body: newData,
            }).catch((error) => {
                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this._setInLocalStorage("userData", this.userData);
                }
            });
        }
    }

    /**
     * Synchronously reset all user data
     * @returns {Object} Empty data object
     */
    resetData() {
        // Reset local cache immediately
        this.userData = {};

        // If not authenticated, use localStorage immediately
        if (!window.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background reset
            this._backgroundResetData();
        }

        return this;
    }

    /**
     * Background reset for resetData
     * @private
     */
    _backgroundResetData() {
        this._apiRequest("/api/user/data", {
            method: "DELETE",
        }).catch((error) => {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this._setInLocalStorage("userData", this.userData);
            }
        });
    }

    /**
     * Synchronously get user metadata
     * @returns {Object} User metadata object
     */
    getMetadata() {
        return this.metadataCache;
    }

    /**
     * Synchronously get user profile
     * @returns {Object} User profile data
     */
    getProfile() {
        return this.profileCache;
    }

    /**
     * Check authentication status and refresh data (remains async)
     * This can be called when you specifically want to refresh all data
     * @returns {Promise<boolean>} Authentication status
     */
    /**
     * Check authentication status and refresh data (remains async)
     * This can be called when you specifically want to refresh all data
     * @returns {Promise<boolean>} Authentication status
     */
    async refreshAllData() {
        // Use the server-injected authentication status instead of making an API call
        this.usingLocalStorage = !window.isAuthenticated;

        if (window.isAuthenticated) {
            try {
                // Refresh all data for authenticated users
                await Promise.allSettled([
                    this._apiRequest("/api/user/data").then((response) => {
                        this.userData = response.data || {};
                    }),
                    this._apiRequest("/api/user").then((response) => {
                        this.profileCache = response;
                    }),
                    this._apiRequest("/api/user/metadata").then((response) => {
                        this.metadataCache = response.metadata || {};
                    }),
                ]);

                return true;
            } catch (error) {
                // If the API calls fail, fall back to localStorage
                console.error("Failed to refresh data from server:", error);
                this.usingLocalStorage = true;
                this._warnUnauthenticated();

                // Load from localStorage
                this.userData = this._getFromLocalStorage("userData") || {};
                this.profileCache = this._getFromLocalStorage("profile") || {
                    username: "guest",
                    displayName: "Guest User",
                    isGuest: true,
                };
                this.metadataCache =
                    this._getFromLocalStorage("metadata") || {};

                return false;
            }
        } else {
            // For unauthenticated users, use localStorage
            this._warnUnauthenticated();

            // Load from localStorage
            this.userData = this._getFromLocalStorage("userData") || {};
            this.profileCache = this._getFromLocalStorage("profile") || {
                username: "guest",
                displayName: "Guest User",
                isGuest: true,
            };
            this.metadataCache = this._getFromLocalStorage("metadata") || {};

            return false;
        }
    }

    /**
     * Sign in the user (remains async)
     * @param {string} username - User's username or email
     * @param {string} password - User's password
     * @returns {Promise<Object>} User profile data
     */
    async signIn(username, password) {
        try {
            const response = await this._apiRequest(
                "/api/auth/signin",
                {
                    method: "POST",
                    body: { username, password },
                },
                false,
            );

            window.isAuthenticated = true;
            this.usingLocalStorage = false;

            // Reset all caches
            this.userData = {};
            this.metadataCache = {};
            this.profileCache = {};

            // Load fresh data
            await this.refreshAllData();

            // Migrate localStorage data if any exists
            await this._migrateLocalDataToServer();

            return response;
        } catch (error) {
            window.isAuthenticated = false;
            this.usingLocalStorage = true;
            throw error;
        }
    }

    /**
     * Migrate local storage data to server after login (remains async)
     * @private
     * @returns {Promise<void>}
     */
    async _migrateLocalDataToServer() {
        try {
            const localData = this._getFromLocalStorage("userData");
            if (localData && Object.keys(localData).length > 0) {
                // Use the async version internally
                await this._apiRequest("/api/user/data", {
                    method: "PUT",
                    body: localData,
                });
                console.log("Local data migrated to server account");
            }
        } catch (error) {
            console.error("Failed to migrate local data to server:", error);
        }
    }
}

// Initialize with singleton pattern
const Account = new UserAccount();
(async function () {
    try {
        Account.mergeWithDefaults(); // Call the method inside a try-catch
        await Account.refreshAllData();
        console.log(
            "%c Account successfully merged with default data!",
            "color: rgb(0, 255, 119); background-color: rgba(0, 255, 119, 0.1); padding: 12px;",
        );
    } catch (error) {
        console.error("Account failed to merge with default data:", error);
    }
})();

// Export the singleton instance
window.Account = Account;
