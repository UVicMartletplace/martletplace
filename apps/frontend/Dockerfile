FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig*.json vite.config.ts index.html ./
COPY src public ./

CMD npm start
