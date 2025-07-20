import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { TaskmanRouter, HelloWorld } from "@taskman/backend";

const client = createTRPCClient<TaskmanRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:8000",
    }),
  ],
});

async function main() {
  try {
    const response = await client.addHello.mutate({ name: "my new hello!"});
    testPrint(response);
  
  } catch (error) {
    console.error("Error calling tRPC endpoint:", error);
  }
}

function testPrint(world: HelloWorld) {
  console.log("Hello World ID:", world.id);
  console.log("Hello World Name:", world.name);
}

await main();