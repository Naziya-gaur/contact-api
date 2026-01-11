require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const ContactInquiry = require("./models/ContactInquiry");

const app = express();

/* MIDDLEWARE */
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: "10kb" }));

/* RATE LIMIT */
app.use(
  "/api/contact",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
  })
);

/* MONGODB CONNECT */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error:", err));

/* API */
app.post("/api/contact", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      message,
      city,
      region,
      country,
      latitude,
      longitude
    } = req.body;

    if (!first_name || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    /* SAVE TO DB */
    await ContactInquiry.create({
      first_name,
      last_name,
      email,
      phone,
      message,
      city,
      region,
      country,
      latitude,
      longitude,
      ip_address: req.ip
    });

    /* EMAIL */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Fine Optics" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "New Contact Inquiry",
      html: `
        <b>Name:</b> ${first_name} ${last_name}<br>
        <b>Email:</b> ${email}<br>
        <b>Phone:</b> ${phone || "-"}<br>
        <b>Message:</b> ${message}<br>
        <b>Location:</b> ${city}, ${region}, ${country}
      `
    });

    res.json({ message: "Inquiry submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* START SERVER */
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
