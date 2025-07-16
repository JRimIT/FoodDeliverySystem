import express from "express";
import Discount from "../models/discount.model.js";
import User from "../models/user.model.js";
import sendMail from "../utils/mailer.js"; // đã cấu hình sẵn
import { verifyUser } from "../config/jwtConfig.js";

const router = express.Router();

router.get("/discounts", verifyUser, async (req, res) => {
  const discounts = await Discount.find({ expiryDate: { $gt: new Date() } });
  res.render("discounts", { discounts });
});

// 📩 Gửi mã giảm giá cho tất cả người dùng (admin hoặc CRON job sẽ gọi)
router.post("/send-discounts", async (req, res) => {
  try {
    const users = await User.find({});
    const discount = await Discount.findOne({
      isSent: false,
      expiryDate: { $gt: new Date() },
    });

    if (!discount) return res.status(404).send("No available discount.");

    const htmlContent = `
      <h2>🎁 Mã Giảm Giá Đặc Biệt Dành Cho Bạn!</h2>
      <p><strong>Mã:</strong> ${discount.code}</p>
      <p>${discount.description}</p>
      <p>💸 Giảm ${discount.percentage}% - Hạn dùng: ${new Date(
      discount.expiryDate
    ).toLocaleDateString()}</p>
    `;

    for (const user of users) {
      if (user.email) {
        await sendMail(
          user.email,
          "🎉 Nhận Mã Giảm Giá Từ Foodie!",
          htmlContent
        );
      }
    }

    discount.isSent = true;
    await discount.save();

    res.send("Đã gửi mã giảm giá cho tất cả người dùng.");
  } catch (err) {
    console.error("Gửi mã giảm giá thất bại:", err);
    res.status(500).send("Gửi thất bại.");
  }
});

// Người dùng nhận mã thủ công
router.post("/claim/:id", verifyUser, async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    const user = req.user;

    if (!discount) return res.status(404).send("Không tìm thấy mã.");

    const htmlContent = `
      <h2>🎁 Bạn vừa nhận được mã giảm giá!</h2>
      <p><strong>Mã:</strong> ${discount.code}</p>
      <p>${discount.description}</p>
      <p>💸 Giảm ${discount.percentage}% - Hạn dùng: ${new Date(
      discount.expiryDate
    ).toLocaleDateString()}</p>
    `;

    await sendMail(user.email, "✅ Mã Giảm Giá Của Bạn", htmlContent);
    res.send(
      `<script>alert("Đã gửi mã về email của bạn!"); window.location.href='/discounts';</script>`
    );
  } catch (err) {
    console.error("Lỗi nhận mã:", err);
    res.status(500).send("Lỗi nhận mã.");
  }
});

export default router;
