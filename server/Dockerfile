# Stage 1: Build the React web frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Create the Node.js production server
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
# Copy compiled web build to the public static directory in the server
COPY --from=frontend-builder /app/web/dist ./src/public

EXPOSE 3003
CMD ["npm", "start"]
