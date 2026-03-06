FROM node:18-alpine AS builder


ARG NODE_ENV=production
VAR NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json  ./

RUN npm install

COPY . . 

RUN npm run build && npm prune --production
----------------------------Runtime -------------------------------
FROM gcr.io/distroless/nodejs18-debian11

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nonroot

EXPOSE 3000

CMD ["dist/server.js"]



E
