import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // cho phép null và vẫn đảm bảo không trùng nhau nếu có giá trị
    trim: true,
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  postCode: {
    type: String,
    default: "",
  },
  dateOfBirth: {
    type: Date,
  },
  avatarUrl: {
    type: String,
    default:
      "https://i.pinimg.com/1200x/dc/6c/b0/dc6cb0521d182f959da46aaee82e742f.jpg",
  },
  role: {
    type: String,
    enum: ["admin", "customer"],
    default: "customer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
