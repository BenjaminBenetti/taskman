import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TaskmanRouter } from "@taskman/backend";

const client = createTRPCClient<TaskmanRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
    }),
  ],
});

try {
  // Test the config endpoint
  const config = await client.config.clientConfig.query();
  console.log("Config endpoint response:");
  console.log(JSON.stringify(config, null, 2));
} catch (error) {
  console.error("Error calling config endpoint:", error);
}