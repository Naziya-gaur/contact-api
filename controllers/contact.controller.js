const db = require("../config/db");
const transporter = require("../config/mail");

exports.submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message, honeypot } = req.body;

    // Honeypot spam protection
    if (honeypot) return res.status(200).json({ success: true });

    await db.query(
      `INSERT INTO contact_inquiries
       (first_name, last_name, email, phone, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, phone, message, req.ip]
    );

    await transporter.sendMail({
      to: process.env.MAIL_TO,
      subject: "New Contact Inquiry",
      html: `
        <h3>New Inquiry</h3>
        <p><b>Name:</b> ${firstName} ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone}</p>
        <p><b>Message:</b><br>${message}</p>
      `
    });

    res.json({ success: true, message: "Thank you! We'll contact you soon." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Try again." });
  }
};
