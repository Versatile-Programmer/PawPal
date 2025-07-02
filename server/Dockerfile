# Use a specific Node.js version. 'alpine' is a good choice for smaller size.
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app


# Copy package.json and lock files first to leverage Docker's layer caching
COPY package*.json ./

# Install all dependencies (both prod and dev for TypeScript compilation)
RUN npm install

# Copy the Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client so 'npx prisma' commands work later
RUN npx prisma generate


# Copy the rest of your application source code
COPY . .

# Compile TypeScript to JavaScript. The output will be in the 'dist' folder.
RUN npm run build

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Copy and set up entrypoint script
COPY --chown=node:node entrypoint.sh .
# RUN chmod +x ./entrypointScript.sh

RUN sed -i 's/\r$//' ./entrypoint.sh && \
    chmod +x ./entrypoint.sh


# Expose the port your Express app runs on (e.g., 3001)
EXPOSE 3001

# Set the entrypoint Script that migrates prisma model to postgresdb
ENTRYPOINT [ "./entrypoint.sh" ]

# The command to start your application's server
CMD ["node", "dist/server.js"]
