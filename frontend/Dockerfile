# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite env vars (must be set at build time)
ARG VITE_API_URL=/api/v1
ARG VITE_SOCKET_URL=

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Set env vars for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build
RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
