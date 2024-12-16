# Stage 1: Build the application
FROM node:20-alpine AS builder

# install build tools required to run node-rdkafka
RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python3

# Add build deps required by node-kafka
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

# Set the working directory inside the container
WORKDIR /app

# Install dependencies (without running other scripts)
COPY package*.json ./

RUN npm ci --ignore-scripts

# Rebuild node-rdkafka to ensure native bindings are built correctly
RUN npm rebuild node-rdkafka

# Copy the rest of the application files
COPY . .

# Run DB Migrations
RUN npm run prisma:generate

# Build the TypeScript application
RUN npm run compile


# ----------------------------------------------------------------------------------------

# Stage 2: Intermediary builder to generate prisma engine
FROM node:20-alpine AS engine-builder

WORKDIR /app

COPY --chown=node:node --from=builder /app/prisma/schema.prisma ./app/prisma/

RUN npx prisma generate --schema=./app/prisma/schema.prisma

# ----------------------------------------------------------------------------------------

# Stage 3: Run the application
FROM node:20-alpine AS runner

# Set Node Environment
ENV NODE_ENV=production

# install build tools required to run node-rdkafka
RUN apk --no-cache add \
      bash \
      g++ \
      ca-certificates \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev \
      make \
      python3 \
      openssl1.1-compat

# Add build deps required by node-kafka
RUN apk add --no-cache --virtual .build-deps gcc zlib-dev libc-dev bsd-compat-headers py-setuptools bash

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/.env ./
COPY --chown=node:node --from=builder /app/kafkaclient.properties ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./p

# Create logs directory
RUN mkdir logs

# Remove any existing node_modules to avoid conflicting node_modules between other stages and the runner stage and install only production packages
RUN npm ci --omit=dev --ignore-scripts

# Rebuild node-rdkafka to ensure native bindings are built correctly
RUN npm rebuild node-rdkafka

# Copy generated prisma client
COPY --chown=node:node --from=engine-builder  /app/node_modules/.prisma/client ./node_modules/.prisma/client

# Expose the application port (change this if your app runs on a different port)
EXPOSE 4000

# Define the command to run the application
CMD ["npm", "start"]
