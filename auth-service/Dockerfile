# Base image (nhẹ, ổn định)
FROM node:22-alpine

# Tạo thư mục app
WORKDIR /app

# Cài dependency trước (tối ưu cache layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Bật hot reload (nodemon hoặc @nestjs/cli)
RUN yarn global add @nestjs/cli

# Port chạy trong container (NestJS default 3000)
EXPOSE 3000

# Chạy ở chế độ dev (hot reload)
CMD ["yarn", "start:dev"]
