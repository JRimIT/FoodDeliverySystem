# Sử dụng image Node.js gọn nhẹ (Alpine)
FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json vào trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt các thư viện (chỉ cài dependencies thực tế, bỏ qua devDependencies cho nhẹ nếu muốn, ở đây cài tất cả)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose port (Mặc định trong file bin/www.js là 4000)
EXPOSE 4000

# Khởi chạy server bằng node thay vì nodemon để tối ưu hiệu suất trong môi trường Docker/Production
CMD ["node", "./bin/www.js"]
