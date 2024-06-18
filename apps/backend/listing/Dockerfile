FROM node:20

RUN apt-get update && apt-get install -y xvfb

WORKDIR /app/service

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY --from=lib ./ ../lib/
COPY src ./

CMD npm start
