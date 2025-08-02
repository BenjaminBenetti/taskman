import type { AuthProvider, TokenPayload, UserInfo } from "../interfaces/auth-provider.interface.ts";
import { JWTService } from "../services/jwt.service.ts";

/**
 * Internal Authentication Provider
 * 
 * Handles JWT token verification for internal authentication within the TaskMan system.
 * Implements the AuthProvider interface for self-issued JWT tokens using the JWTService.
 * Provides internal authentication capabilities for scenarios where external OAuth is not required.
 */
export class InternalAuthProvider implements AuthProvider {
  /* ========================================
   * Public Properties
   * ======================================== */
  
  readonly name = "internal";
  
  /* ========================================
   * Private Properties
   * ======================================== */
  
  private _jwtService: JWTService | null = null;
  
  /* ========================================
   * Constructor
   * ======================================== */
  
  constructor() {
    // JWT service will be initialized lazily when needed
  }
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Verifies an internal JWT token and extracts the payload
   * 
   * @param token - The internal JWT token string to verify
   * @returns Promise<TokenPayload> - The verified token payload containing user claims
   * @throws Error if token verification fails or required claims are missing
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      // Initialize JWT service if not already done
      this._initializeJwtService();
      
      if (!this._jwtService) {
        throw new Error("JWT service not initialized");
      }
      
      // Verify the JWT token
      const payload = await this._jwtService.verifyToken(token);
      
      // Convert internal JWT payload to standard TokenPayload format
      return {
        sub: payload.sub,
        iss: payload.iss,
        email: payload.email,
        name: payload.name,
        tenantId: payload.tenantId,
        iat: payload.iat,
        exp: payload.exp,
      };
    } catch (error) {
      throw new Error(`Internal token verification failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Gets user information from internal JWT token
   * 
   * @param token - The internal JWT token string
   * @returns Promise<UserInfo> - User information with guaranteed email
   * @throws Error if token verification fails or email is not available
   */
  async getUserInfoFromToken(token: string): Promise<UserInfo> {
    const payload = await this.verifyToken(token);
    
    if (!payload.email) {
      throw new Error("Email is required but not found in internal token payload");
    }
    
    return {
      email: payload.email,
      name: payload.name,
    };
  }
  
  /* ========================================
   * Private Methods
   * ======================================== */
  
  /**
   * Initializes the JWT service lazily for token operations
   * 
   * @throws Error if JWT service initialization fails
   */
  private _initializeJwtService(): void {
    if (this._jwtService) {
      return; // Already initialized
    }
    
    try {
      this._jwtService = new JWTService();
    } catch (error) {
      throw new Error(`JWT service initialization failed: ${(error as Error).message}`);
    }
  }
}