import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const sendMail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"Foodie Express" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};

export default sendMail;
