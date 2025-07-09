import mongoose from "mongoose";
import './user.model.js'
import './product.model.js'


const reviewSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
})

const Review = mongoose.models.review || mongoose.model('Review', reviewSchema);

export default Review; 