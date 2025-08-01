import type { User } from "../users/models/user.model.ts";
import { AuthProviderFactory } from "../auth/factories/auth-provider.factory.ts";
import { AuthService } from "../auth/services/auth.service.ts";
import type { IncomingMessage } from "node:http";

/**
 * TRPC Context Interface
 * 
 * Defines the shape of the context object passed to all TRPC procedures.
 */
export interface Context {
  user: User | null;
  req: IncomingMessage;
}

/**
 * Creates the TRPC context for each request
 * 
 * Extracts authentication information from the request headers and
 * attempts to authenticate the user using the appropriate auth provider.
 * 
 * @param req - The incoming HTTP request object (Node.js IncomingMessage)
 * @returns Promise<Context> - The context object containing user information
 */
export async function createTRPCContext(req: IncomingMessage): Promise<Context> {
  /* ========================================
   * Extract Authorization Header
   * ======================================== */
  
  const authHeader = req.headers.authorization;
  let user = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    try {
      /* ========================================
       * Authenticate User
       * ======================================== */
      
      user = await _authenticateUser(token);
    } catch (error) {
      console.warn("Authentication failed:", (error as Error).message);
    }
  }

  return { user, req };
}

/* ========================================
 * Private Helper Functions
 * ======================================== */

/**
 * Authenticates a user based on the provided JWT token
 * 
 * If user doesn't exist, creates them with info from identity provider.
 * If user exists, updates them with latest info from identity provider.
 * Handles tenant and assignee creation for new users.
 * 
 * @param token - The JWT token to authenticate
 * @returns Promise<User | null> - The authenticated user or null if authentication fails
 * @throws Error if authentication process fails
 */
async function _authenticateUser(token: string): Promise<User | null> {
  // For now, default to Google provider
  // TODO: Determine provider from token or other means
  const provider = AuthProviderFactory.create("google");
  const authService = new AuthService();
  
  const payload = await provider.verifyToken(token);
  
  // Context should only find existing users, not create them
  // User creation happens during initial auth flow, not on every request
  const user = await authService.findExistingUserFromToken(payload, provider.name);

  return user;
}