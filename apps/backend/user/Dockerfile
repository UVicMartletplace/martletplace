FROM node:20

WORKDIR /app/lib
COPY --from=lib ./ ./
RUN npm install

WORKDIR /app/service

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src ./

HEALTHCHECK CMD curl -f http://localhost:8211/.well-known/health

HEALTHCHECK CMD curl -f http://localhost:8211/.well-known/health

CMD npm start
