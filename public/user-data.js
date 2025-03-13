/**
 * UserAccount.js - Client library for user account management
 *
 * This library provides methods to interact with user data stored in JSONbin
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
        this.settingsCache = null;
        this.profileCache = null;
        this.isAuthenticated = window.isAuthenticated || false;
        this.authError = new Error("User is not authenticated");
        this.authError.code = "UNAUTHENTICATED";
        this.dataFetchPromise = null; // Promise to track in-flight data requests
        this.usingLocalStorage = false;
    }

    /**
     * Makes an API request
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
     * Check if the user is currently authenticated
     * @returns {boolean} Authentication status
     * @deprecated Use isLoggedIn() instead
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Log the user out by redirecting to the logout page
     * This method uses a server-side logout flow with redirects
     */
    logout() {
        window.localStorage.clear();
        window.localStorage.setItem("fromLogout", "true");
        window.open("/logout", "_self");
    }

    /**
     * Sign in the user
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
            ); // This endpoint doesn't require authentication

            this.isAuthenticated = true;
            this.usingLocalStorage = false;
            // Reset all caches on new sign in
            this.clearAllCaches();
            // Transfer any localStorage data to the server
            await this._migrateLocalDataToServer();
            return response;
        } catch (error) {
            this.isAuthenticated = false;
            this.usingLocalStorage = true;
            throw error;
        }
    }

    /**
     * Sign out the current user
     * @returns {Promise<Object>} Result of sign out operation
     * @deprecated Use logout() instead for the server-side logout flow
     */
    async signOut() {
        try {
            const response = await this._apiRequest(
                "/api/auth/signout",
                {
                    method: "POST",
                },
                false,
            ); // Don't require auth for signout

            // Reset state and clear caches
            this.clearAllCaches();
            this.isAuthenticated = false;
            this.usingLocalStorage = true;

            return response;
        } catch (error) {
            // Still reset state even if the API call fails
            this.clearAllCaches();
            this.isAuthenticated = false;
            this.usingLocalStorage = true;
            throw error;
        }
    }

    /**
     * Clear all cached data
     * @private
     */
    clearAllCaches() {
        this.userData = null;
        this.metadataCache = null;
        this.settingsCache = null;
        this.profileCache = null;
        this.dataFetchPromise = null;
    }

    /**
     * Migrate local storage data to server after login
     * @private
     * @returns {Promise<void>}
     */
    async _migrateLocalDataToServer() {
        try {
            const localData = this._getFromLocalStorage("userData");
            if (localData && Object.keys(localData).length > 0) {
                await this.updateData(localData);
                console.log("Local data migrated to server account");
            }

            const localSettings = this._getFromLocalStorage("settings");
            if (localSettings && Object.keys(localSettings).length > 0) {
                await this.updateSettings(localSettings);
                console.log("Local settings migrated to server account");
            }
        } catch (error) {
            console.error("Failed to migrate local data to server:", error);
        }
    }

    /**
     * Fetch the current user profile
     * @param {boolean} forceRefresh - Force a refresh of the cached data
     * @returns {Promise<Object>} User profile data
     */
    async getProfile(forceRefresh = false) {
        // If using localStorage, return a basic profile
        if (!this.isAuthenticated) {
            this._warnUnauthenticated();
            const localProfile = this._getFromLocalStorage("profile") || {
                username: "guest",
                displayName: "Guest User",
                isGuest: true,
            };
            this.profileCache = localProfile;
            return localProfile;
        }

        // Return cached profile if available and not forcing refresh
        if (this.profileCache && !forceRefresh) {
            return this.profileCache;
        }

        try {
            const response = await this._apiRequest("/api/user");
            this.profileCache = response;
            return response;
        } catch (error) {
            if (error.code === "UNAUTHENTICATED") {
                // Fallback to localStorage profile
                const localProfile = this._getFromLocalStorage("profile") || {
                    username: "guest",
                    displayName: "Guest User",
                    isGuest: true,
                };
                this.profileCache = localProfile;
                return localProfile;
            }
            throw error;
        }
    }

    /**
     * Fetch all user data
     * @param {boolean} forceRefresh - Force a refresh of the cached data
     * @returns {Promise<Object>} User data object
     */
    async getData(forceRefresh = false) {
        // Return cached data if available and not forcing refresh
        if (this.userData && !forceRefresh) {
            return this.userData;
        }

        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this.userData = this._getFromLocalStorage("userData") || {};
            return this.userData;
        }

        // If there's already a request in progress, wait for it instead of making a new one
        if (this.dataFetchPromise && !forceRefresh) {
            try {
                return await this.dataFetchPromise;
            } catch (error) {
                // If the in-flight request fails, allow a new request to be made
                this.dataFetchPromise = null;

                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this.userData = this._getFromLocalStorage("userData") || {};
                    return this.userData;
                }

                throw error;
            }
        }

        // Create a new fetch promise and store it
        this.dataFetchPromise = this._apiRequest("/api/user/data")
            .then((response) => {
                this.userData = response.data || {};
                this.dataFetchPromise = null; // Clear the promise when done
                return this.userData;
            })
            .catch((error) => {
                this.dataFetchPromise = null; // Clear the promise on error

                // If authentication error, fallback to localStorage
                if (error.code === "UNAUTHENTICATED") {
                    this._warnUnauthenticated();
                    this.userData = this._getFromLocalStorage("userData") || {};
                    return this.userData;
                }

                throw error;
            });

        return this.dataFetchPromise;
    }

    /**
     * Get a specific user data value
     * @param {string} key - The data key to retrieve
     * @param {boolean} forceRefresh - Force a refresh of all data
     * @returns {Promise<any>} The value for the specified key
     */
    async getValue(key, forceRefresh = false) {
        // If we haven't loaded data yet or forcing refresh, load it first
        if (this.userData === null || forceRefresh) {
            await this.getData(forceRefresh);
        }

        return this.userData[key];
    }

    /**
     * Set a single data value
     * @param {string} key - The data key to update
     * @param {any} value - The new value
     * @returns {Promise<Object>} Updated data object
     */
    async setValue(key, value) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();

            // Make sure userData is loaded first
            if (this.userData === null) {
                await this.getData();
            }

            // Update the value
            this.userData[key] = value;
            this._setInLocalStorage("userData", this.userData);
            return this.userData;
        }

        try {
            const response = await this._apiRequest(`/api/user/data/${key}`, {
                method: "POST",
                body: { value },
            });

            // Update local cache
            this.userData = response.data || {};
            return this.userData;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();

                // Make sure userData is loaded first
                if (this.userData === null) {
                    await this.getData();
                }

                // Update the value
                this.userData[key] = value;
                this._setInLocalStorage("userData", this.userData);
                return this.userData;
            }

            throw error;
        }
    }

    /**
     * Update multiple data values at once
     * @param {Object} updates - Object containing key-value pairs to update
     * @returns {Promise<Object>} Updated data object
     */
    async updateData(updates) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();

            // Make sure userData is loaded first
            if (this.userData === null) {
                await this.getData();
            }

            // Update the values
            this.userData = { ...this.userData, ...updates };
            this._setInLocalStorage("userData", this.userData);
            return this.userData;
        }

        try {
            const response = await this._apiRequest("/api/user/data", {
                method: "PUT",
                body: updates,
            });

            // Update local cache
            this.userData = response.data || {};
            return this.userData;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();

                // Make sure userData is loaded first
                if (this.userData === null) {
                    await this.getData();
                }

                // Update the values
                this.userData = { ...this.userData, ...updates };
                this._setInLocalStorage("userData", this.userData);
                return this.userData;
            }

            throw error;
        }
    }

    /**
     * Delete a specific data key
     * @param {string} key - The data key to delete
     * @returns {Promise<Object>} Updated data object
     */
    async deleteValue(key) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();

            // Make sure userData is loaded first
            if (this.userData === null) {
                await this.getData();
            }

            // Delete the value
            delete this.userData[key];
            this._setInLocalStorage("userData", this.userData);
            return this.userData;
        }

        try {
            const response = await this._apiRequest(`/api/user/data/${key}`, {
                method: "DELETE",
            });

            // Update local cache
            this.userData = response.data || {};
            return this.userData;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();

                // Make sure userData is loaded first
                if (this.userData === null) {
                    await this.getData();
                }

                // Delete the value
                delete this.userData[key];
                this._setInLocalStorage("userData", this.userData);
                return this.userData;
            }

            throw error;
        }
    }

    /**
     * Reset all user data
     * @returns {Promise<Object>} Empty data object
     */
    async resetData() {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this.userData = {};
            this._setInLocalStorage("userData", this.userData);
            return this.userData;
        }

        try {
            const response = await this._apiRequest("/api/user/data", {
                method: "DELETE",
            });

            // Update local cache
            this.userData = {};
            return this.userData;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this.userData = {};
                this._setInLocalStorage("userData", this.userData);
                return this.userData;
            }

            throw error;
        }
    }

    /**
     * Fetch user metadata
     * @param {boolean} forceRefresh - Force a refresh of the cached data
     * @returns {Promise<Object>} User metadata object
     */
    async getMetadata(forceRefresh = false) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this.metadataCache = this._getFromLocalStorage("metadata") || {};
            return this.metadataCache;
        }

        // Return cached metadata if available and not forcing refresh
        if (this.metadataCache && !forceRefresh) {
            return this.metadataCache;
        }

        try {
            const response = await this._apiRequest("/api/user/metadata");
            this.metadataCache = response.metadata || {};
            return this.metadataCache;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this.metadataCache =
                    this._getFromLocalStorage("metadata") || {};
                return this.metadataCache;
            }

            throw error;
        }
    }

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     * @returns {Promise<Object>} Updated settings object
     */
    async updateSettings(settings) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();

            // Make sure settings are loaded first
            if (this.settingsCache === null) {
                await this.getSettings();
            }

            // Update settings
            this.settingsCache = { ...this.settingsCache, ...settings };
            this._setInLocalStorage("settings", this.settingsCache);
            return this.settingsCache;
        }

        try {
            const response = await this._apiRequest("/api/user/settings", {
                method: "POST",
                body: settings,
            });

            // Update settings cache
            this.settingsCache = response.settings || {};
            return this.settingsCache;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();

                // Make sure settings are loaded first
                if (this.settingsCache === null) {
                    await this.getSettings();
                }

                // Update settings
                this.settingsCache = { ...this.settingsCache, ...settings };
                this._setInLocalStorage("settings", this.settingsCache);
                return this.settingsCache;
            }

            throw error;
        }
    }

    /**
     * Get user settings
     * @param {boolean} forceRefresh - Force a refresh of the cached data
     * @returns {Promise<Object>} User settings object
     */
    async getSettings(forceRefresh = false) {
        // If not authenticated, use localStorage
        if (!this.isAuthenticated || this.usingLocalStorage) {
            this._warnUnauthenticated();
            this.settingsCache = this._getFromLocalStorage("settings") || {};
            return this.settingsCache;
        }

        // Return cached settings if available and not forcing refresh
        if (this.settingsCache && !forceRefresh) {
            return this.settingsCache;
        }

        try {
            const response = await this._apiRequest("/api/user/settings");
            this.settingsCache = response.settings || {};
            return this.settingsCache;
        } catch (error) {
            // If authentication error, fallback to localStorage
            if (error.code === "UNAUTHENTICATED") {
                this._warnUnauthenticated();
                this.settingsCache =
                    this._getFromLocalStorage("settings") || {};
                return this.settingsCache;
            }

            throw error;
        }
    }

    /**
     * Check authentication status with the server
     * @returns {Promise<boolean>} Authentication status
     */
    async checkAuthStatus() {
        try {
            await this._apiRequest("/api/auth/status", {}, false);
            this.isAuthenticated = true;
            this.usingLocalStorage = false;
            return true;
        } catch (error) {
            this.isAuthenticated = false;
            this.usingLocalStorage = true;
            this._warnUnauthenticated();
            return false;
        }
    }

    /**
     * Preload all user data on page initialization
     * This method can be called on page load to fetch and cache all commonly used data
     * @returns {Promise<void>}
     */
    async preloadUserData() {
        try {
            await this.checkAuthStatus();

            // Use Promise.allSettled to load all data in parallel
            // and continue even if some requests fail
            await Promise.allSettled([
                this.getData(),
                this.getProfile(),
                this.getMetadata(),
                this.getSettings(),
            ]);
        } catch (error) {
            console.warn("Preload failed:", error);
            // If authentication failed, load from localStorage
            if (!this.isAuthenticated) {
                this.getData();
                this.getProfile();
                this.getMetadata();
                this.getSettings();
            }
        }
    }
}

// Initialize with singleton pattern
const Account = new UserAccount();

// Automatically preload data when the DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        Account.preloadUserData().catch((err) =>
            console.warn("Preload failed:", err),
        );
    });
} else {
    Account.preloadUserData().catch((err) =>
        console.warn("Preload failed:", err),
    );
}
