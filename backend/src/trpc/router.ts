import { router, publicProcedure } from "./index.ts";
import { protectedProcedure } from "./middleware/protectedProcedure.ts";
import { z } from "zod";

export const appRouter = router({
  auth: router({
    me: protectedProcedure
      .query(({ ctx }) => {
        return ctx.user;
      })
  }),
  
  health: publicProcedure
    .query(() => {
      return { status: "ok", timestamp: new Date().toISOString() };
    })
});

export type TaskmanRouter = typeof appRouter;