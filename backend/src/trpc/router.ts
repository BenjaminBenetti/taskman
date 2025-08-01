import { router, publicProcedure } from "./index.ts";
import { configRouter } from "./routers/config.router.ts";
import { googleRouter } from "./routers/auth/google.router.ts";
import { userRouter } from "./routers/users/user.router.ts";

export const appRouter = router({
  auth: router({
    google: googleRouter,
  }),  
  users: userRouter,
  config: configRouter,

  /**
   * Health check endpoint
   * 
   * Returns a simple status message to verify the service is running.
   */
  health: publicProcedure
    .query(() => {
      return { status: "ok", timestamp: new Date().toISOString() };
    })
});

export type TaskmanRouter = typeof appRouter;