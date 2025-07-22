import { jwtVerify } from "jose";
import type { AuthProvider, TokenPayload } from "../interfaces/auth-provider.interface.ts";
import type { User } from "@taskman/backend";
import { prisma } from "../../prisma/index.ts";

/**
 * Google Authentication Provider
 * 
 * Handles JWT token verification and user lookup for Google identity provider.
 * Implements the AuthProvider interface for Google-specific authentication logic.
 */
export class GoogleAuthProvider implements AuthProvider {
  /* ========================================
   * Public Properties
   * ======================================== */
  
  readonly name = "google";
  
  /* ========================================
   * Private Properties
   * ======================================== */
  
  private readonly _secret: Uint8Array;
  
  /* ========================================
   * Constructor
   * ======================================== */
  
  constructor() {
    const jwtSecret = Deno.env.get("JWT_SECRET") || "your-secret-key";
    this._secret = new TextEncoder().encode(jwtSecret);
  }
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Verifies a JWT token and extracts the payload
   * 
   * @param token - The JWT token string to verify
   * @returns Promise<TokenPayload> - The verified token payload containing user claims
   * @throws Error if token verification fails or required claims are missing
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this._secret);
      
      if (!payload.sub || !payload.iss) {
        throw new Error("Invalid token: missing sub or iss claims");
      }
      
      return {
        sub: payload.sub as string,
        iss: payload.iss as string,
        email: payload.email as string | undefined,
        ...payload
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