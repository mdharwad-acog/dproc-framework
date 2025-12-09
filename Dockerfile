# Use Playwright base image (includes Chromium for PDF generation)
FROM mcr.microsoft.com/playwright:v1.48.0-noble

# Install pnpm
RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 5555

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/cli/index.js", "serve", "--host", "0.0.0.0", "--port", "5555"]
