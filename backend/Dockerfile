FROM denoland/deno:2.4.2

WORKDIR /app

# Copy deno.json first for better caching
COPY deno.json .

# Cache dependencies
RUN deno cache --reload --lock=deno.lock --lock-write deno.json || true

# Copy application code
COPY . .

# Cache main.ts dependencies
RUN deno cache main.ts

# Expose port
EXPOSE 8000

# Run the application
CMD ["deno", "run", "--allow-net", "main.ts"]