import express from "express";
import https from "https";
import axios from "axios";

import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { countProduct } from "../controllers/countCart.js";
import { verifyUser } from "../config/jwtConfig.js";

const router = express.Router();

const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

// 🟢 Gắn verifyUser vào POST route
router.post("/review/:productId", verifyUser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;
    const review = await Review.create({
      userId,
      productId,
      rating,
      comment,
    });

    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id },
    });

    res.redirect(`/detail/${productId}`);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
