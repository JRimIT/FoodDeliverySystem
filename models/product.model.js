import mongoose from "mongoose";
import './review.model.js'

const productSchema = new mongoose.Schema({

    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    category: String,
    reviews: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Review' }
    ],
    createdAt: { type: Date, default: Date.now }
})

const Product = mongoose.models.product || mongoose.model('Product', productSchema);

export default Product; 