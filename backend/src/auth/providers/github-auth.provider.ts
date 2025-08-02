import type { AuthProvider, TokenPayload, UserInfo } from "../interfaces/auth-provider.interface.ts";
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
   * Gets user information from GitHub API including email address
   * 
   * @param token - The GitHub access token string
   * @returns Promise<UserInfo> - User information with guaranteed email
   * @throws Error if user info cannot be retrieved or email is not available
   */
  async getUserInfoFromToken(token: string): Promise<UserInfo> {
    try {
      // First get basic user info
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskMan-Agent'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`GitHub API user request failed: ${userResponse.status} ${userResponse.statusText}`);
      }
      
      const userData = await userResponse.json();
      
      // If user has a public email, use it
      if (userData.email) {
        return {
          email: userData.email,
          name: userData.name || undefined,
          login: userData.login,
          avatar_url: userData.avatar_url || undefined,
        };
      }
      
      // Otherwise, fetch emails from /user/emails endpoint
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'TaskMan-Agent'
        }
      });
      
      if (!emailResponse.ok) {
        throw new Error(`GitHub API emails request failed: ${emailResponse.status} ${emailResponse.statusText}`);
      }
      
      const emails = await emailResponse.json();
      
      // Find the primary email
      const primaryEmail = emails.find((email: any) => email.primary);
      if (!primaryEmail) {
        throw new Error("No primary email found for GitHub user");
      }
      
      return {
        email: primaryEmail.email,
        name: userData.name || undefined,
        login: userData.login,
        avatar_url: userData.avatar_url || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to get user info from GitHub: ${(error as Error).message}`);
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