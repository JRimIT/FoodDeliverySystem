import express from "express";
import { verifyUser } from "../config/jwtConfig.js";
import User from "../models/user.model.js";
import { countProduct } from "../controllers/countCart.js";
import Transaction from "../models/transaction.model.js";
import Order from "../models/order.model.js";

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

// Trang nạp tiền
router.get("/wallet/deposit", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const cartCount = await countProduct(req.user.userId);
  res.render("pages/Deposit", { user, cartCount });
});

// Xử lý nạp tiền
router.post("/wallet/deposit", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const amount = parseInt(req.body.amount);
  if (isNaN(amount) || amount <= 0) {
    return res.render("pages/Deposit", { user, cartCount: await countProduct(user._id), error: "Số tiền nạp không hợp lệ!" });
  }
  user.balance += amount;
  await user.save();
  await Transaction.create({
    userId: user._id,
    type: 'deposit',
    amount,
    balanceAfter: user.balance,
    description: `Nạp tiền vào ví: +${amount.toLocaleString()} VND`,
  });
  res.render("pages/Deposit", { user, cartCount: await countProduct(user._id), success: `Nạp thành công ${amount.toLocaleString()} VND!` });
});

// Lịch sử giao dịch
router.get("/wallet/history", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const cartCount = await countProduct(req.user.userId);
  const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 });
  res.render("pages/TransactionHistory", { user, cartCount, transactions });
});

// Lịch sử đơn hàng của user
router.get("/orders", verifyUser, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const cartCount = await countProduct(req.user.userId);
  const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).populate('items.productId');
  res.render("pages/OrderHistory", { user, cartCount, orders });
});

export default router;
