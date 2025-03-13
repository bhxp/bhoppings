
/**
 * UserAccount.js - Client library for user account management
 *
 * This library provides methods to interact with user data stored in JSONbin
 * through the server API endpoints.
 */

class UserAccount {
    /**
     * Create a new UserAccount instance
     * @param {Object} options - Configuration options
     * @param {string} options.baseUrl - Base URL for API requests (defaults to current origin)
     */
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || window.location.origin;
        this.userData = null;
        this.isAuthenticated = window.isAuthenticated || false;
    }

    /**
     * Makes an API request
     * @private
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Object>} Response data
     */
    async _apiRequest(endpoint, options = {}) {
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
     * Check if the user is currently authenticated
     * @returns {boolean} Authentication status
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    /**
     * Fetch the current user profile
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        return this._apiRequest("/api/user");
    }

    /**
     * Fetch all user data
     * @returns {Promise<Object>} User data object
     */
    async getData() {
        const response = await this._apiRequest("/api/user/data");
        this.userData = response.data || {};
        return this.userData;
    }

    /**
     * Get a specific user data value
     * @param {string} key - The data key to retrieve
     * @returns {Promise<any>} The value for the specified key
     */
    async getValue(key) {
        // If we haven't loaded data yet, load it first
        if (this.userData === null) {
            await this.getData();
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
        const response = await this._apiRequest(`/api/user/data/${key}`, {
            method: "POST",
            body: { value },
        });

        // Update local cache
        this.userData = response.data || {};
        return this.userData;
    }

    /**
     * Update multiple data values at once
     * @param {Object} updates - Object containing key-value pairs to update
     * @returns {Promise<Object>} Updated data object
     */
    async updateData(updates) {
        const response = await this._apiRequest("/api/user/data", {
            method: "PUT",
            body: updates,
        });

        // Update local cache
        this.userData = response.data || {};
        return this.userData;
    }

    /**
     * Delete a specific data key
     * @param {string} key - The data key to delete
     * @returns {Promise<Object>} Updated data object
     */
    async deleteValue(key) {
        const response = await this._apiRequest(`/api/user/data/${key}`, {
            method: "DELETE",
        });

        // Update local cache
        this.userData = response.data || {};
        return this.userData;
    }

    /**
     * Reset all user data
     * @returns {Promise<Object>} Empty data object
     */
    async resetData() {
        const response = await this._apiRequest("/api/user/data", {
            method: "DELETE",
        });

        // Update local cache
        this.userData = {};
        return this.userData;
    }

    /**
     * Fetch user metadata
     * @returns {Promise<Object>} User metadata object
     */
    async getMetadata() {
        const response = await this._apiRequest("/api/user/metadata");
        return response.metadata || {};
    }

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     * @returns {Promise<Object>} Updated settings object
     */
    async updateSettings(settings) {
        const response = await this._apiRequest("/api/user/settings", {
            method: "POST",
            body: settings,
        });

        return response.settings || {};
    }
}

const Account = new UserAccount();