import express from "express";
import { verifyUser } from "../config/jwtConfig.js";
import { countProduct } from "../controllers/countCart.js";
import User from "../models/user.model.js";
import sendMail from "../utils/mailer.js";

const router = express.Router();

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const htmlContent = `
  <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: auto;">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://i.pinimg.com/736x/0f/27/7f/0f277f5f07a6399788894bc1062b5308.jpg" alt="Foodie Express" style="width: 120px;" />
      <h2 style="color: #ff6600;">🍽️ Foodie Express - Contact Message</h2>
    </div>

    <div style="background-color: #fdfdfd; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      <h3 style="color: #333;">New Message from <span style="color: #ff6600;">${name}</span></h3>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
      <p><strong>Message:</strong></p>
      <blockquote style="border-left: 4px solid #ff6600; margin: 10px 0; padding-left: 15px; color: #555;">
        ${message}
      </blockquote>
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
      © ${new Date().getFullYear()} Foodie Express. All rights reserved.
    </div>
  </div>
`;

    await sendMail(process.env.GMAIL_USER, `Contact from ${name}`, htmlContent);

    res.send(
      `<script>alert("Your message has been sent successfully!"); window.location.href = "/contact";</script>`
    );
  } catch (err) {
    console.error("❌ Failed to send contact email:", err);
    res.status(500).send("Failed to send message.");
  }
});

export default router;
