const express = require("express");
const router = express.Router();

const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const schema = require("../schemas/contact.schema");
const { submitContact } = require("../controllers/contact.controller");

router.post("/", rateLimiter, validate(schema), submitContact);

module.exports = router;
