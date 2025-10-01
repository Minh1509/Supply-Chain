FROM node:22-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false && \
    yarn cache clean && \
    rm -rf /tmp/* /var/cache/apk/*
COPY . .
EXPOSE 3000
CMD ["yarn", "start:dev"]
