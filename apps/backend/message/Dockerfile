FROM node:20

WORKDIR /app/lib
COPY --from=lib package*.json ./
COPY --from=lib tsconfig.json ./
RUN npm install

WORKDIR /app/service
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY --from=lib src /app/lib/src
COPY src ./

HEALTHCHECK CMD curl -f http://localhost:8214/.well-known/health

CMD npm start
