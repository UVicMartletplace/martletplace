FROM node:20

WORKDIR /app/service

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY --from=lib ./ ../lib/
COPY src ./

CMD npm start
