# Sử dụng node image chính thức
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build ứng dụng
RUN npm run build

# Expose port 5175
EXPOSE 5175

# Khởi chạy ứng dụng
CMD ["npm", "run", "preview", "--", "--port", "5175", "--host"] 