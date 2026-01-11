const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async (data) => {
  await transporter.sendMail({
    from: `"Fine Opticals" <${process.env.EMAIL_USER}>`,
    to: "fineopticalindia@gmail.com",
    subject: "New Contact Inquiry",
    html: `
      <h3>New Inquiry Received</h3>
      <p><b>Name:</b> ${data.first_name} ${data.last_name}</p>
      <p><b>Email:</b> ${data.email}</p>
      <p><b>Phone:</b> ${data.phone}</p>
      <p><b>Message:</b> ${data.message}</p>
      <p><b>Location:</b> ${data.city}, ${data.country}</p>
    `
  });
};
