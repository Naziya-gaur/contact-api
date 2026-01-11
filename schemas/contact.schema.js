const Joi = require("joi");

module.exports = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().allow(""),
  email: Joi.string().email().required(),
  phone: Joi.string().allow(""),
  message: Joi.string().min(10).required(),
  honeypot: Joi.string().allow("")
});
