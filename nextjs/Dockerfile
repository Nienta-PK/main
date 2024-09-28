#--- DOCKERFILE ---#
FROM node:20.17-alpine3.20

WORKDIR /src

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Disable Next.js telemetry (optional)
RUN npx next telemetry disable

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
