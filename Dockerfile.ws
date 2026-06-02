FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

RUN npm install -g tsx

COPY . .

# Expose your WebSocket port (8080)
EXPOSE 8080

# Replace "node" "server.js" with your actual custom WS start command
CMD ["npm", "run","socket"]