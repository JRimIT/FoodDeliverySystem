import mongoose from "mongoose";
import './product.model.js'
import './user.model.js'

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            price: Number
        }
    ],
    totalPrice: Number,
    status: { type: String, enum: ['Pending', 'Shipping', 'Delivered', 'Completed', 'Cancelled'], default: 'Pending' },
    address: String,
    paymentMethod: { type: String, default: 'cod' },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.order || mongoose.model('Order', orderSchema);
export default Order;