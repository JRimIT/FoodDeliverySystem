// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cấu hình Cloudinary từ .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_avatars", // thư mục lưu ảnh trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  },
});

export { cloudinary, storage };
