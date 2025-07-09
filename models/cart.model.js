import mongoose from "mongoose";
import './product.model.js'
import './user.model.js'

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number
        }
    ],
    createdAt: { type: Date, default: Date.now }
}
)

const Cart = mongoose.models.cart || mongoose.model('Cart', cartSchema);

export default Cart; 