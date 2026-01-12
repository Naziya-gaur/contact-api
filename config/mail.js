const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (data) => {
  transporter.sendMail({
  from: `"Fine Optical" <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_USER,
  subject: "New Contact Inquiry",
  html: `...`
}).catch(err => {
  console.error("Email failed:", err.message);
});
};
