require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const ContactInquiry = require("./models/ContactInquiry");

const app = express();

/* ===================== MIDDLEWARE ===================== */
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

/* ===================== EMAIL BACKGROUND TASK ===================== */
async function sendEmailInBackground(data) {
  try {
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

  // RESPOND IMMEDIATELY (NO WAITING)
  res.json({ message: "Inquiry submitted successfully" });

  // BACKGROUND TASKS
  setImmediate(async () => {
    try {
      await ContactInquiry.create({
        ...data,
        ip_address: req.ip
      });

      sendEmailInBackground(data);

    } catch (err) {
      console.error("Background task failed:", err.message);
    }
  });
});

/* ===================== SERVER ===================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
