import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./src/trpc/router.ts";
import { createTRPCContext } from "./src/trpc/context.ts";
import { prisma } from "./src/prisma/index.ts";
import { writeErrorLog } from "./src/trpc/middleware/utils/logging.utils.ts";

// Connect to DB
await prisma.$connect();

// setup the TRPC server
const server = createHTTPServer({
  router: appRouter,
  createContext: ({ req }) => createTRPCContext(req),
  /**
     * Global error handler for all TRPC procedures
     * 
     * This handler captures all errors that occur in TRPC procedures and logs them
     * with full stack traces and context information for debugging purposes.
     * 
     * @param opts - Error context including error, procedure info, and request details
     */
    onError: ({ error, type, path, ctx }) => {
      writeErrorLog(error, {
        path,
        type,
        user: ctx?.user?.email,
        tenantId: ctx?.user?.tenantId
      });
    }
});

const port = 8000;
server.listen(port);
console.log(`TRPC server running on http://localhost:${port}`);