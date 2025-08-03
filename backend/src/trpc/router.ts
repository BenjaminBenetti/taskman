import { router } from "./index.ts";
import { publicProcedure } from "./middleware/publicProcedure.ts";
import { configRouter } from "./routers/config.router.ts";
import { googleRouter } from "./routers/auth/google.router.ts";
import { githubRouter } from "./routers/auth/github.router.ts";
import { internalRouter } from "./routers/auth/internal.router.ts";
import { userRouter } from "./routers/users/user.router.ts";
import { taskRouter } from "./routers/tasks/task.router.ts";


export const appRouter = router({
  auth: router({
    google: googleRouter,
    github: githubRouter,
    internal: internalRouter,
  }),
  users: userRouter,
  tasks: taskRouter,
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