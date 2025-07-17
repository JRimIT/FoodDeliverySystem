import Order from "../models/order.model.js";

export const getDashboard = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Shipping" })
      .populate("items.productId", "name price imageUrl")
      .lean();

    res.render("shipper/dashboard", {
      orders,
      user: req.session.user
    });
  } catch (err) {
    res.status(500).send("Error loading shipper dashboard");
  }
};

export const markDelivered = async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.orderId, { status: "Completed" });
    res.redirect("/shipper/dashboard");
  } catch (err) {
    res.status(500).send("Failed to update order status");
  }
};
