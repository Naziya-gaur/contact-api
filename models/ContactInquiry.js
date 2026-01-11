const mongoose = require("mongoose");

const ContactInquirySchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: String,
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },

  city: String,
  region: String,
  country: String,
  latitude: String,
  longitude: String,

  ip_address: String,

  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ContactInquiry", ContactInquirySchema);
