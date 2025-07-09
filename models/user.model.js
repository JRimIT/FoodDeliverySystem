import mongoose from "mongoose";
import './product.model.js'

const userSchema = new mongoose.Schema({

    username: String,
    password: String,
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 