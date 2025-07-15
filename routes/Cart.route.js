import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import https from "https";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { verifyUser } from "../config/jwtConfig.js";
import Cart from "../models/cart.model.js";
import { countProduct } from "../controllers/countCart.js";

const router = express.Router();
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

router.get("/view/cart", verifyUser, async (req, res) => {
  try {
    console.log("User: ", req.user.userId);
    const user = req.user;
    const cart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: "items",
      populate: {
        path: "product",
        select: "name price imageUrl",
      },
    });
    console.log(`cart: `, cart);
    const cartCount = await countProduct(req.user.userId);

    if (cart) {
      const totalPrice = await cart.items.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);

      res.render("pages/Cart", {
        items: cart.items,
        total: totalPrice,
        cartCount: cartCount,
        user,
      });
    } else {
      res.render("pages/Cart", {
        items: [],
        total: 0,
        cartCount: cartCount,
        user,
      });
    }

    // res.json(cart)
  } catch (error) {
    console.error("Error fetching /view/cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/cart/add/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;
    const quantity = parseInt(req.query.quantity) || 1;

    const existCart = await Cart.findOne({ userId });

    if (existCart) {
      // Nếu đã có cart, kiểm tra xem sản phẩm đã có chưa
      const existingItem = existCart.items.find(
        (item) => item.product._id.toString() === productId
      );

      if (existingItem) {
        // Nếu đã có thì tăng số lượng
        existingItem.quantity += quantity;
      } else {
        // Nếu chưa có thì thêm mới
        // existCart.items.push({ productId, quantity });
        await Cart.findOneAndUpdate(
          { userId: userId },
          {
            $push: { items: { product: productId, quantity } },
          }
        );
      }

      await existCart.save();
    } else {
      // Nếu chưa có cart thì tạo mới
      await Cart.create({
        userId,
        items: [{ product: productId, quantity }],
      });
    }

    res.redirect(`/detail/${productId}`);
  } catch (error) {
    console.error("Error fetching /cart/add/", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/cart/update/:itemId", async (req, res) => {
  try {
    const userId = req.user.userId; // Lấy từ middleware verifyUser (nếu có)
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    await Cart.findOneAndUpdate(
      { userId: userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } }
    );

    res.redirect("/view/cart"); // Hoặc gửi JSON nếu là API
  } catch (error) {
    console.error("Error updating item quantity in cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/cart/remove/:productId", verifyUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Lọc bỏ item có productId trùng
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.redirect("/view/cart"); // Sau khi xóa chuyển hướng về trang giỏ hàng
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
