import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TaskmanRouter, HelloWorld } from "@taskman/backend";

const client = createTRPCClient<TaskmanRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
    }),
  ],
});

try {
  const me = await client.auth.me.query();
  console.log("Ready for implementation");
} catch (error) {
  console.error("Error calling tRPC endpoint:", error);
}