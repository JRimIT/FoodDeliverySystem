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
import Transaction from "../models/transaction.model.js";

const router = express.Router();
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

router.get("/view/cart", verifyUser, async (req, res) => {
  try {
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(req.user.userId);
    const cart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: "items",
      populate: {
        path: "product",
        select: "name price imageUrl",
      },
    });
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

router.get("/checkout", verifyUser, async (req, res) => {
  try {
    // Lấy thông tin giỏ hàng của user
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "product",
        select: "name price imageUrl",
      },
    });
    const cartCount = await countProduct(userId);
    // Lấy user mới nhất từ DB để lấy balance đúng
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId);
    // Render trang checkout
    res.render("pages/Checkout", {
      user: user,
      cart: cart,
      cartCount: cartCount,
    });
  } catch (error) {
    console.error("Error loading checkout page:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/checkout", verifyUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { address, note, paymentMethod } = req.body;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: { path: "product", select: "name price imageUrl" },
    });
    if (!cart || !cart.items.length) {
      return res.status(400).send("Giỏ hàng trống!");
    }
    // Tính tổng tiền
    const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    // Lấy user
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(userId);
    // Xử lý thanh toán
    if (paymentMethod === 'wallet') {
      if (user.balance < totalPrice) {
        // Không đủ tiền, trả về trang checkout với popup lỗi
        const cartCount = await countProduct(userId);
        return res.render("pages/Checkout", {
          user,
          cart,
          cartCount,
          error: `Số dư ví không đủ để thanh toán! Bạn cần nạp thêm tiền.`
        });
      }
      user.balance -= totalPrice;
      await user.save();
      await Transaction.create({
        userId: user._id,
        type: 'payment',
        amount: totalPrice,
        balanceAfter: user.balance,
        description: `Thanh toán đơn hàng: -${totalPrice.toLocaleString()} VND`,
      });
    }
    // Tạo order mới
    const orderItems = cart.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    }));
    const Order = (await import('../models/order.model.js')).default;
    await Order.create({
      userId,
      items: orderItems,
      totalPrice,
      address,
      note,
      status: 'Pending',
      createdAt: new Date(),
      paymentMethod: paymentMethod || 'cod',
    });
    // Xóa giỏ hàng sau khi đặt hàng thành công
    cart.items = [];
    await cart.save();
    // Chuyển hướng sang trang thông báo thành công
    res.redirect("/checkout/success");
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Đặt hàng thất bại. Vui lòng thử lại!");
  }
});

router.get("/checkout/success", verifyUser, async (req, res) => {
  // Đếm lại số sản phẩm trong giỏ (sau khi đặt hàng là 0)
  const cartCount = await countProduct(req.user.userId);
  res.render("pages/CheckoutSuccess", { user: req.user, cartCount });
});

router.get("/order/:productId", verifyUser, async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.query.quantity) || 1;
    const Product = (await import('../models/product.model.js')).default;
    const product = await Product.findById(productId);
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(req.user.userId);
    const cartCount = await countProduct(req.user.userId);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm!");
    res.render("pages/OrderNow", {
      user,
      product,
      quantity,
      cartCount,
      error: undefined
    });
  } catch (error) {
    console.error("Error loading order now page:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/order/:productId", verifyUser, async (req, res) => {
  try {
    const productId = req.params.productId;
    const quantity = parseInt(req.query.quantity) || 1;
    const { address, note, paymentMethod } = req.body;
    const Product = (await import('../models/product.model.js')).default;
    const product = await Product.findById(productId);
    const User = (await import('../models/user.model.js')).default;
    const user = await User.findById(req.user.userId);
    const cartCount = await countProduct(req.user.userId);
    if (!product) return res.status(404).send("Không tìm thấy sản phẩm!");
    const totalPrice = product.price * quantity;
    // Xử lý thanh toán
    if (paymentMethod === 'wallet') {
      if (user.balance < totalPrice) {
        return res.render("pages/OrderNow", {
          user,
          product,
          quantity,
          cartCount,
          error: `Số dư ví không đủ để thanh toán! Bạn cần nạp thêm tiền.`
        });
      }
      user.balance -= totalPrice;
      await user.save();
      await Transaction.create({
        userId: user._id,
        type: 'payment',
        amount: totalPrice,
        balanceAfter: user.balance,
        description: `Thanh toán đơn hàng: -${totalPrice.toLocaleString()} VND`,
      });
    }
    // Tạo order mới
    const Order = (await import('../models/order.model.js')).default;
    await Order.create({
      userId: user._id,
      items: [{ productId: product._id, quantity, price: product.price }],
      totalPrice,
      address,
      note,
      status: 'Pending',
      createdAt: new Date(),
      paymentMethod: paymentMethod || 'cod',
    });
    res.redirect("/checkout/success");
  } catch (error) {
    console.error("Error placing order now:", error);
    res.status(500).send("Đặt hàng thất bại. Vui lòng thử lại!");
  }
});

export default router;
