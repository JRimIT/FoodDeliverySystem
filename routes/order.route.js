import express from 'express';
import Order from '../models/order.model.js';
import { confirmReceived } from '../controllers/order.controller.js';

const router = express.Router();

// ✅ Route: Xem lịch sử đơn hàng của chính mình
router.get('/myorders', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/goToLoginPage');
  }

  try {
    const orders = await Order.find({ userId: req.session.user._id })
      .sort({ status: 1, createdAt: -1 }) // Ưu tiên đơn cần xác nhận
      .populate('items.productId');

    res.render('orders/myorders', {
      orders,
      user: req.session.user // ✅ truyền user vào EJS
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải lịch sử đơn hàng.');
  }
});

// ✅ Route: Xác nhận đã nhận hàng
router.post('/confirm/:orderId', confirmReceived);

export default router;
