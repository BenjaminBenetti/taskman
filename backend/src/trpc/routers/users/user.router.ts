import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";

/**
 * User router providing user-related operations
 */
export const userRouter = router({
  /**
   * Get authenticated user information
   */
  me: protectedProcedure
    .query(({ ctx }) => {
      return ctx.user;
    }),
});