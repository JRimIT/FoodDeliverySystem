import express from "express";
import bcrypt from "bcryptjs";
import { verifyUser } from "../config/jwtConfig.js";
import User from "../models/user.model.js";
import { countProduct } from "../controllers/countCart.js";

const router = express.Router();

// Multer config (simple local upload)
import multer from "multer";
import { storage } from "../config/cloudinary.js";
const upload = multer({ storage });

// Profile page
router.get("/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    const cartCount = await countProduct(userId);

    res.render("pages/Profile", { user, cartCount });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server Error");
  }
});

// Settings page
router.get("/settings", verifyUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const cartCount = await countProduct(req.user.userId);
    res.render("pages/Settings", { user, cartCount });
  } catch (err) {
    console.error("Error loading settings:", err);
    res.status(500).send("Server Error");
  }
});

// Update account info
router.post("/updateAccount", verifyUser, async (req, res) => {
  const { fullName, email, password, phone, address, postCode, dateOfBirth } =
    req.body;

  try {
    const updatedFields = {
      fullName,
      email,
      phone,
      address,
      postCode,
    };

    if (dateOfBirth) {
      updatedFields.dateOfBirth = new Date(dateOfBirth);
    }

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    await User.findByIdAndUpdate(req.user.userId, updatedFields);
    res.redirect("/settings");
  } catch (err) {
    console.error("Error updating account:", err);
    res.status(500).send("Error updating account");
  }
});

// Upload avatar to Cloudinary
router.post(
  "/uploadAvatar",
  verifyUser,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const imageUrl = req.file.path; // Cloudinary trả về đường dẫn URL
      await User.findByIdAndUpdate(req.user.userId, { avatarUrl: imageUrl });
      res.redirect("/settings");
    } catch (err) {
      console.error("Upload avatar error:", err);
      res.status(500).send("Upload failed");
    }
  }
);

export default router;
