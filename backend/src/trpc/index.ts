import { initTRPC } from "@trpc/server";
import type { Context } from "./context.ts";

const trpcContext = initTRPC.context<Context>().create();

export const router = trpcContext.router;
export { trpcContext };
export type { TaskmanRouter } from "./router.ts";