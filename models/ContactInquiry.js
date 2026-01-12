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
  latitude: Number,
  longitude: Number,

  ip_address: String,

  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInquiry", ContactInquirySchema);
