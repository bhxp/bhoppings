// simpleRedirector.js

/**
 * Creates redirect middleware functions for Express based on key-value pairs
 * @param {Object} redirectMap - Object where keys are paths to match and values are redirect destinations
 * @returns {Object} Object containing middleware functions for each key
 */
function createRedirects(redirectMap) {
  const middlewares = {};

  // Create a middleware for each key-value pair
  Object.keys(redirectMap).forEach((key) => {
    middlewares[key] = function (req, res) {
      res.redirect(redirectMap[key]);
    };
  });

  return middlewares;
}

module.exports = createRedirects;
