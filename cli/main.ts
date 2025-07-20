import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TaskmanRouter } from "@taskman/backend";

const client = createTRPCClient<TaskmanRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
    }),
  ],
});

async function main() {
  try {
    const response = await client.hello.query({ name: "World"});
    console.log(response);
  } catch (error) {
    console.error("Error calling tRPC endpoint:", error);
  }
}

await main();