FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY app.js server.js ./
COPY db ./db
COPY middleware ./middleware
COPY routes ./routes
EXPOSE 3001
CMD ["node", "server.js"]
