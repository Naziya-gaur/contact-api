require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const axios = require("axios");

const ContactInquiry = require("./models/ContactInquiry");

const app = express();

/* ===================== APP CONFIG ===================== */
app.set("trust proxy", true); // IMPORTANT for Render / IP handling

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10kb" }));

/* ===================== RATE LIMIT ===================== */
app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false
  })
);

/* ===================== MONGODB ===================== */
mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err.message));

/* ===================== GEO LOCATION ===================== */
async function getGeoLocation(ip) {
  try {
    const cleanIP = ip.replace("::ffff:", "");

    const res = await axios.get(`https://ipapi.co/${cleanIP}/json/`, {
      timeout: 4000
    });

    return {
      city: res.data.city,
      region: res.data.region,
      country: res.data.country_name,
      latitude: res.data.latitude,
      longitude: res.data.longitude
    };
  } catch (err) {
    console.warn("Geo lookup failed:", err.message);
    return {};
  }
}

/* ===================== EMAIL SETUP ===================== */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

async function sendEmailInBackground(data) {
  try {
    await transporter.sendMail({
      from: `"Fine Optical" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Inquiry",
      html: `
        <b>Name:</b> ${data.first_name} ${data.last_name || ""}<br>
        <b>Email:</b> ${data.email}<br>
        <b>Phone:</b> ${data.phone || "-"}<br>
        <b>Message:</b> ${data.message}<br>
        <b>Location:</b> ${data.city || "-"}, ${data.region || "-"}, ${data.country || "-"}
      `
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email error:", err.message);
  }
}

/* ===================== API ===================== */
app.post("/api/contact", (req, res) => {
  const data = req.body;

  if (!data.first_name || !data.email || !data.message) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  // RESPOND IMMEDIATELY
  res.json({ message: "Inquiry submitted successfully" });

  // BACKGROUND PROCESS
  setImmediate(async () => {
    try {
      const geo = await getGeoLocation(req.ip);

      await ContactInquiry.create({
        ...data,
        ...geo,
        ip_address: req.ip
      });

      sendEmailInBackground({
        ...data,
        ...geo
      });
    } catch (err) {
      console.error("Background error:", err.message);
    }
  });
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
