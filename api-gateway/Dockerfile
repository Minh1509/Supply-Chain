# Base image nhỏ gọn
FROM node:22-alpine

# Cài dumb-init và bash (bash tiện debug, optional)
RUN apk add --no-cache dumb-init bash

# Tạo thư mục app
WORKDIR /app

# Copy file dependency trước để tối ưu cache
COPY package.json yarn.lock ./

# Cài deps (bao gồm devDeps cho hot reload)
RUN yarn install --frozen-lockfile \
    && yarn cache clean

# Copy toàn bộ source
COPY . .

# Set quyền cho user node
RUN mkdir -p /app/dist && chown -R node:node /app

USER node

# Port default NestJS
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

# Chạy dev mode (hot reload)
CMD ["yarn", "start:dev"]
