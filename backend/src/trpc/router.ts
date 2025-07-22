import { prisma } from "../prisma/index.ts";
import { router, publicProcedure } from "./index.ts";
import { z } from "zod";


export const appRouter = router({
  
});


export type TaskmanRouter = typeof appRouter;