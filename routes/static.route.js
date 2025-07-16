import express from "express";
import { countProduct } from "../controllers/countCart.js";

const router = express.Router();

// About page
router.get("/about", async (req, res) => {
  try {
    let user = req.user;
    if (req.user && req.user.userId) {
      const User = (await import('../models/user.model.js')).default;
      user = await User.findById(req.user.userId);
    }
    const cartCount = req.user?.userId
      ? await countProduct(req.user.userId)
      : 0;
    res.render("pages/About", {
      user,
      cartCount: cartCount,
    });
  } catch (error) {
    console.error("Error rendering About page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Contact page
router.get("/contact", async (req, res) => {
  try {
    let user = req.user;
    if (req.user && req.user.userId) {
      const User = (await import('../models/user.model.js')).default;
      user = await User.findById(req.user.userId);
    }
    const cartCount = req.user?.userId
      ? await countProduct(req.user.userId)
      : 0;
    res.render("pages/Contact", {
      user,
      cartCount: cartCount,
    });
  } catch (error) {
    console.error("Error rendering Contact page:", error);
    res.status(500).send("Internal Server Error");
  }
});
// Help page
router.get("/help", async (req, res) => {
  try {
    let user = req.user;
    if (req.user && req.user.userId) {
      const User = (await import('../models/user.model.js')).default;
      user = await User.findById(req.user.userId);
    }
    const cartCount = req.user?.userId
      ? await countProduct(req.user.userId)
      : 0;
    res.render("pages/Help", {
      user,
      cartCount: cartCount,
    });
  } catch (error) {
    console.error("Error rendering Help page:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
