require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const sql = require("mssql/msnodesqlv8");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

/* RATE LIMIT */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/contact", limiter);

/* SQL CONFIG (WINDOWS AUTH) */
const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

/* CONTACT API */
app.post("/api/contact", async (req, res) => {
  try {
    const {
      first_name, last_name, email, phone, message,
      city, region, country, latitude, longitude
    } = req.body;

    if (!first_name || !email || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("first_name", sql.VarChar, first_name)
      .input("last_name", sql.VarChar, last_name)
      .input("email", sql.VarChar, email)
      .input("phone", sql.VarChar, phone)
      .input("message", sql.NVarChar(sql.MAX), message)
      .input("city", sql.VarChar, city)
      .input("region", sql.VarChar, region)
      .input("country", sql.VarChar, country)
      .input("latitude", sql.VarChar, latitude)
      .input("longitude", sql.VarChar, longitude)
      .input("ip_address", sql.VarChar, req.ip)
      .query(`
        INSERT INTO contact_inquiries
        (first_name, last_name, email, phone, message,
         city, region, country, latitude, longitude, ip_address)
        VALUES
        (@first_name, @last_name, @email, @phone, @message,
         @city, @region, @country, @latitude, @longitude, @ip_address)
      `);

    /* EMAIL (optional) */
    if (process.env.EMAIL_PASS) {
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
          <b>Phone:</b> ${phone}<br>
          <b>Message:</b> ${message}<br>
          <b>Location:</b> ${city}, ${region}, ${country}
        `
      });
    }

    res.json({ message: "Inquiry submitted successfully" });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
