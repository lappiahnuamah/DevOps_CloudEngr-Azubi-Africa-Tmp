# # Stage 1: Build the Next.js app
# FROM node:18-alpine AS builder

# # Set the working directory
# WORKDIR /app

# # Copy package.json and lockfile for better caching
# COPY package.json package-lock.json ./

# # Install dependencies
# RUN npm ci --legacy-peer-deps

# # Copy the rest of the code
# COPY . .

# # Build arguments (secrets/keys available at build time if needed)
# ARG SECRET_COOKIE_PASSWORD
# ENV SECRET_COOKIE_PASSWORD=$SECRET_COOKIE_PASSWORD

# # Build the app (standalone mode must be set in next.config.js)
# RUN npm run build


# # Stage 2: Production image
# FROM node:22-alpine AS runner

# WORKDIR /app

# ENV NODE_ENV=production
# # Ensure same Next.js port
# EXPOSE 3000

# # Copy standalone server
# COPY --from=builder /app/.next/standalone ./
# # Copy static assets (needed for images, JS, CSS, etc.)
# COPY --from=builder /app/.next/static ./.next/static
# # Copy public folder
# COPY --from=builder /app/public ./public

# # Run the standalone Next.js server
# CMD ["node", "server.js"]


# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy project files
COPY . .

# Build Next.js app (using environment variables from .env)
ARG NEXT_PUBLIC_TINY_MCE_API_KEY
ARG NEXT_PUBLIC_BACKEND_API_HOST

ENV NEXT_PUBLIC_TINY_MCE_API_KEY=$NEXT_PUBLIC_TINY_MCE_API_KEY
ENV NEXT_PUBLIC_BACKEND_API_HOST=$NEXT_PUBLIC_BACKEND_API_HOST

RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]
