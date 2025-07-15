import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;
