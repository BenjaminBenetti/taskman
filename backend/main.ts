import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./src/trpc/router.ts";
import { createTRPCContext } from "./src/trpc/context.ts";
import { prisma } from "./src/prisma/index.ts";

// Connect to DB
await prisma.$connect();

// setup the TRPC server
const server = createHTTPServer({
  router: appRouter,
  createContext: ({ req }) => createTRPCContext(req),
});

const port = 8000;
server.listen(port);
console.log(`TRPC server running on http://localhost:${port}`);