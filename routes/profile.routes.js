import express from "express";
import { verifyUser } from "../config/jwtConfig.js";
import User from "../models/user.model.js";
import { countProduct } from "../controllers/countCart.js";

const router = express.Router();

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

export default router;
