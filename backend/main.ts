import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./src/trpc/router.ts";

const server = createHTTPServer({
  router: appRouter,
});

const port = 8000;
server.listen(port);
console.log(`TRPC server running on http://localhost:${port}`);