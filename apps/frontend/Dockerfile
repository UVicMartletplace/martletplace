FROM node:20 AS dev
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig*.json vite.config.ts index.html ./
COPY src ./src

RUN npm run build
CMD npm start

FROM ghcr.io/static-web-server/static-web-server:2-alpine AS prod
COPY --from=dev /app/dist /var/public
CMD static-web-server --port 8101 --root /var/public --page-fallback /var/public/index.html
