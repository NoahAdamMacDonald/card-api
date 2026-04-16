FROM oven/bun:1

WORKDIR /app

# Copy package.json and bun.lockb (or bun.lock)
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --production

# Copy the rest of the app
COPY . .

EXPOSE 3000

CMD ["bun", "run", "index.ts"]
