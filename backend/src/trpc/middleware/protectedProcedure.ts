import { TRPCError } from "@trpc/server";
import { trpcContext } from "../index.ts";
import { loggingMiddleware } from "./logging.middleware.ts";

export const protectedProcedure = trpcContext.procedure.use(loggingMiddleware).use((opts) => {
  const { ctx } = opts;
  
  if (!ctx.user) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user
    },
  });
});