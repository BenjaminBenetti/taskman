import { router, publicProcedure } from "../../index.ts";
import { AuthProviderFactory } from "../../../auth/factories/auth-provider.factory.ts";
import { AuthService } from "../../../auth/services/auth.service.ts";

/**
 * User router providing user-related operations
 */
export const userRouter = router({
  /**
   * Get authenticated user information
   * 
   * This endpoint is unauthenticated but requires a Bearer token.
   * It verifies the token, creates or updates the user, and returns user data.
   * If user creation/update fails, the endpoint will throw an error.
   */
  me: publicProcedure
    .query(async ({ ctx }) => {
      const authHeader = ctx.req.headers.authorization;
      
      if (!authHeader?.startsWith("Bearer ")) {
        throw new Error("Authorization header with Bearer token is required");
      }

      const token = authHeader.substring(7);
      
      try {
        // Verify token and create/update user
        const provider = AuthProviderFactory.create("google");
        const authService = new AuthService();
        
        const payload = await provider.verifyToken(token);
        const user = await authService.createOrUpdateUserFromToken(payload, provider.name);
        
        return user;
      } catch (error) {
        // Let it crash if user creation/update fails
        throw new Error(`Authentication failed: ${(error as Error).message}`);
      }
    }),
});