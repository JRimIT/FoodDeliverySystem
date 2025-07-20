import Order from '../models/order.model.js';

export const confirmReceived = async (req, res) => {
  try {
    const userId = req.session.user._id;

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: userId, // Đảm bảo là đơn của user này
      status: 'Delivered' // Chỉ khi đơn đã giao
    });

    if (!order) {
      return res.status(403).send("Không thể xác nhận đơn hàng này.");
    }

    order.status = 'Completed';
    await order.save();

    res.redirect('/orders/myorders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Không thể xác nhận đã nhận hàng');
  }
};

