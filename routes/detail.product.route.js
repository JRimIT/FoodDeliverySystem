import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import https from "https";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { countProduct } from "../controllers/countCart.js";

const router = express.Router();
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

router.get("/detail/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    const category = req.query.category || null;
    const product = await Product.findById(productId).populate({
      path: "reviews",
      populate: {
        path: "userId",
        select: "username",
      },
    });
    console.log("/detail/:productId: ", product);

    // res.json(product)
    if (req.user && req.user.userId) {
      const cartCount = await countProduct(req.user.userId);
      const User = (await import('../models/user.model.js')).default;
      const user = await User.findById(req.user.userId);
      res.render("pages/detailProduct", {
        product: product,
        cartCount: cartCount,
        user,
        category,
      });
    } else {
      res.render("pages/detailProduct", {
        product: product,
        cartCount: 0,
        user: req.user,
      });
    }
  } catch (error) {
    console.error("Error fetching Feature Food:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
