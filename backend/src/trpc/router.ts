import { router, publicProcedure } from "./index.ts";
import { z } from "zod";

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string(), secondLevelStr: z.string().optional() }))
    .query(({ input }) => {
      return `Hello ${input.name} - THIS IS TRPC! ${input.secondLevelStr}`;
    }),
});

export type TaskmanRouter = typeof appRouter;