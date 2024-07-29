FROM node:20 AS dev

WORKDIR /app/lib
COPY --from=lib package*.json ./
COPY --from=lib tsconfig.json ./
RUN npm install

WORKDIR /app/service
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install

COPY --from=lib src /app/lib/src
COPY src/ ./src

RUN npm run build

HEALTHCHECK CMD curl -f http://localhost:8215/.well-known/health
CMD npm start

FROM node:20-bookworm-slim AS prod
WORKDIR /app/service

COPY --from=dev /app/service/node_modules /app/lib/node_modules /app/service/node_modules
COPY --from=dev /app/service/dist /app/service/dist

CMD node ./dist/service/src/index.js
