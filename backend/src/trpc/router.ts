import { prisma } from "../prisma/index.ts";
import { router, publicProcedure } from "./index.ts";
import { z } from "zod";

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string(), secondLevelStr: z.string().optional() }))
    .query(({ input }) => {
      return `Hello ${input.name} - THIS IS TRPC! ${input.secondLevelStr}`;
    }),
  addHello: publicProcedure 
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const result = await prisma.helloWorld.create({
        data: {
          name: input.name,
        },
      });

      console.log("OMG I DID IT!", result.id);
      return result;
    }),
});

export type TaskmanRouter = typeof appRouter;