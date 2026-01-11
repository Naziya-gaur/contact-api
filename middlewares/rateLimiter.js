const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests. Please try later."
});
