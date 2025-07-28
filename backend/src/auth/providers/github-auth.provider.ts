import type { AuthProvider, TokenPayload } from "../interfaces/auth-provider.interface.ts";
import type { User } from "@taskman/backend";
import { prisma } from "../../prisma/index.ts";

/**
 * GitHub Authentication Provider
 * 
 * Handles token verification and user lookup for GitHub identity provider.
 * Implements the AuthProvider interface for GitHub-specific authentication logic.
 */
export class GitHubAuthProvider implements AuthProvider {
  /* ========================================
   * Public Properties
   * ======================================== */
  
  readonly name = "github";
  
  /* ========================================
   * Constructor
   * ======================================== */
  
  constructor() {
    // No initialization needed for GitHub auth
  }
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Verifies a GitHub access token and extracts user information
   * 
   * @param token - The GitHub access token string to verify
   * @returns Promise<TokenPayload> - The verified token payload containing user claims
   * @throws Error if token verification fails or required claims are missing
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      // Fetch user information from GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskMan-Agent'
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      
      if (!userData.id) {
        throw new Error("Invalid token: missing user ID");
      }
      
      return {
        sub: userData.id.toString(), // GitHub user ID as string
        iss: "github",
        email: userData.email || undefined,
        login: userData.login,
        name: userData.name || undefined,
        avatar_url: userData.avatar_url || undefined,
      };
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Finds a user in the database based on the token payload
   * 
   * @param payload - The verified token payload containing identity information
   * @returns Promise<User | null> - The user entity if found, null otherwise
   */
  async findUserByPayload(payload: TokenPayload): Promise<User | null> {
    return await prisma.user.findFirst({
      where: {
        identityProviderId: payload.sub,
        identityProvider: this.name,
        deletedAt: null
      }
    });
  }
}