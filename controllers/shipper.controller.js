import Order from "../models/order.model.js";

export const getDashboard = async (req, res) => {
  try {
    const availableOrders = await Order.find({ status: "Processing" })
      .populate("items.productId", "name price imageUrl")
      .populate("userId", "username name")
      .sort({ createdAt: -1 })
      .lean();

    const shippingOrders = await Order.find({ status: "Shipping" })
      .populate("items.productId", "name price imageUrl")
      .populate("userId", "username name")
      .sort({ createdAt: -1 })
      .lean();

    res.render("shipper/dashboard", {
      availableOrders,
      shippingOrders,
      user: req.session.user
    });
  } catch (err) {
    console.error("Error loading shipper dashboard:", err);
    res.status(500).send("Error loading shipper dashboard");
  }
};

export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status: "Shipping" });
    
    // Notify the user
    if (order && order.userId) {
      const Notification = (await import("../models/notification.model.js")).default;
      await Notification.create({
        userId: order.userId,
        title: "Đơn hàng đang giao",
        message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã được Shipper nhận giao và đang trên đường đến!`,
        type: "order_status"
      });
    }

    res.redirect("/shipper/dashboard");
  } catch (err) {
    console.error("Error accepting order:", err);
    res.status(500).send("Failed to accept order");
  }
};

export const markDelivered = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status: "Completed" });

    // Notify the user
    if (order && order.userId) {
      const Notification = (await import("../models/notification.model.js")).default;
      await Notification.create({
        userId: order.userId,
        title: "Giao hàng thành công",
        message: `Đơn hàng #${order._id.toString().slice(-8).toUpperCase()} của bạn đã được giao thành công! Chúc bạn ngon miệng!`,
        type: "order_status"
      });
    }

    res.redirect("/shipper/dashboard");
  } catch (err) {
    console.error("Error marking order delivered:", err);
    res.status(500).send("Failed to update order status");
  }
};
