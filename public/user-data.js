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
        this.isAuthenticated = window.isAuthenticated === true;
        this.authError = new Error("User is not authenticated");
        this.authError.code = "UNAUTHENTICATED";
        this.usingLocalStorage = !this.isAuthenticated;

        // Initialize data immediately
        this._initializeData();
    }

    /**
     * Initialize all data synchronously on startup
     * @private
     */
    _initializeData() {
        // For unauthenticated users, load from localStorage immediately
        if (!this.isAuthenticated || this.usingLocalStorage) {
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
        if (this.isAuthenticated && !this.usingLocalStorage) {
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
        if (requireAuth && !this.isAuthenticated) {
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
                    this.isAuthenticated = false;
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
        if (!this.usingLocalStorage) {
            console.warn(
                "User is not signed in. Using localStorage as fallback for data storage.",
            );
        }
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
        return this.isAuthenticated;
    }

    /**
     * Log the user out by redirecting to the logout page
     */
    logout() {
        window.localStorage.clear();
        window.localStorage.setItem("fromLogout", "true");
        window.open("/logout", "_self");
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
     * Synchronously get a specific user data value
     * @param {string} key - The data key to retrieve
     * @returns {any} The value for the specified key (or undefined if not found)
     */
    getValue(key) {
        return this.userData[key];
    }

    /**
     * Synchronously set a single data value
     * @param {string} key - The data key to update
     * @param {any} value - The new value
     * @returns {Object} Updated data object
     */
    setValue(key, value) {
        // Update the local cache immediately
        this.userData[key] = value;

        // If not authenticated, use localStorage immediately
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background save
            this._backgroundSaveValue(key, value);
        }

        return this.userData;
    }

    /**
     * Background save for setValue
     * @private
     * @param {string} key - The data key to update
     * @param {any} value - The new value
     */
    _backgroundSaveValue(key, value) {
        this._apiRequest(`/api/user/data/${key}`, {
            method: "POST",
            body: { value },
        }).catch((error) => {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this._setInLocalStorage("userData", this.userData);
            }
        });
    }

    /**
     * Synchronously update multiple data values at once
     * @param {Object} updates - Object containing key-value pairs to update
     * @returns {Object} Updated data object
     */
    updateData(updates) {
        // Update the local cache immediately
        this.userData = { ...this.userData, ...updates };

        // If not authenticated, use localStorage immediately
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background save
            this._backgroundSaveData(updates);
        }

        return this.userData;
    }

    /**
     * Background save for updateData
     * @private
     * @param {Object} updates - Object containing key-value pairs to update
     */
    _backgroundSaveData(updates) {
        this._apiRequest("/api/user/data", {
            method: "PUT",
            body: updates,
        }).catch((error) => {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this._setInLocalStorage("userData", this.userData);
            }
        });
    }

    /**
     * Synchronously delete a specific data key
     * @param {string} key - The data key to delete
     * @returns {Object} Updated data object
     */
    deleteValue(key) {
        // Delete from local cache immediately
        delete this.userData[key];

        // If not authenticated, use localStorage immediately
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background delete
            this._backgroundDeleteValue(key);
        }

        return this.userData;
    }

    /**
     * Background delete for deleteValue
     * @private
     * @param {string} key - The data key to delete
     */
    _backgroundDeleteValue(key) {
        this._apiRequest(`/api/user/data/${key}`, {
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
     * Synchronously reset all user data
     * @returns {Object} Empty data object
     */
    resetData() {
        // Reset local cache immediately
        this.userData = {};

        // If not authenticated, use localStorage immediately
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this._setInLocalStorage("userData", this.userData);
        } else {
            // For authenticated users, start a background reset
            this._backgroundResetData();
        }

        return this.userData;
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
    async refreshAllData() {
        try {
            const isAuth = await this._apiRequest(
                "/api/auth/status",
                {},
                false,
            );
            this.isAuthenticated = true;
            this.usingLocalStorage = false;

            // Refresh all data
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
            this.isAuthenticated = false;
            this.usingLocalStorage = true;
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

            this.isAuthenticated = true;
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
            this.isAuthenticated = false;
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

// Export the singleton instance
window.Account = Account;
