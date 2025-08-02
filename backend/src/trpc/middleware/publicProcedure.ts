import { trpcContext } from "../index.ts";
import { loggingMiddleware } from "./logging.middleware.ts";


export const publicProcedure = trpcContext.procedure.use(loggingMiddleware);