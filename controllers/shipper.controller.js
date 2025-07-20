import Order from "../models/order.model.js";

export const getDashboard = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["Pending", "Shipping"] }
    }).populate("items.productId", "name price imageUrl").lean();

    res.render("shipper/dashboard", {
      orders,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send("Error loading shipper dashboard");
  }
};

export const acceptOrder = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.orderId, {
      status: "Shipping",
      shipperId: req.session.user._id
    });
    res.redirect("/shipper/dashboard");
  } catch (err) {
    res.status(500).send("Lỗi khi nhận đơn hàng.");
  }
};

export const markDelivered = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.orderId, {
      status: "Delivered"
    });
    res.redirect("/shipper/dashboard");
  } catch (err) {
    res.status(500).send("Lỗi khi đánh dấu đã giao.");
  }
};
