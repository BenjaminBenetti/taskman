import { router, publicProcedure } from "./index.ts";
import { protectedProcedure } from "./middleware/protectedProcedure.ts";
import { configRouter } from "./routers/config.router.ts";
import { googleRouter } from "./routers/auth/google.router.ts";

export const appRouter = router({
  auth: router({
    me: protectedProcedure
      .query(({ ctx }) => {
        return ctx.user;
      }),
    google: googleRouter,
  }),
  
  config: configRouter,
  
  health: publicProcedure
    .query(() => {
      return { status: "ok", timestamp: new Date().toISOString() };
    })
});

export type TaskmanRouter = typeof appRouter;