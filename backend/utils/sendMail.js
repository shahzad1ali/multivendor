const nodemailer = require("nodemailer");

const sendMail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD, // must be app password
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err; // propagate error to your route
  }
};

module.exports = sendMail;
