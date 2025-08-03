import type { TokenExchangeResult } from "../interfaces/token-exchange-result.interface.ts";
import type { User } from "../../users/models/user.model.ts";
import type { ExternalAuthProvider } from "../types/auth-provider.type.ts";
import { TRPCError } from "@trpc/server";
import { AuthProviderFactory } from "../factories/auth-provider.factory.ts";
import { AuthService } from "./auth.service.ts";
import { JWTService } from "./jwt.service.ts";

/**
 * Internal Token Exchange Service
 * 
 * Handles the exchange of external provider tokens (Google, GitHub) for internal
 * JWT tokens. This service validates external tokens, creates/finds users, and
 * generates internal tokens for authenticated sessions.
 */
export class InternalTokenExchangeService {
  /* ========================================
   * Private Properties
   * ======================================== */
  
  private readonly authService = new AuthService();
  private readonly jwtService = new JWTService();
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Exchange an external provider token for an internal JWT token
   * 
   * This method validates the external token with the appropriate provider,
   * creates or updates the user from the token payload, and generates an
   * internal JWT token for the authenticated session.
   * 
   * @param providerToken - The access token from the external provider
   * @param provider - The external authentication provider type
   * @returns Promise<TokenExchangeResult> - The internal token and expiration info
   * @throws Error if token validation fails or user creation fails
   */
  async exchangeToken(
    providerToken: string,
    provider: ExternalAuthProvider
  ): Promise<TokenExchangeResult> {
    try {
      // Validate the external provider token (still needed for token validation)
      await this._validateExternalToken(providerToken, provider);
      
      // Create or update user from the provider token (now handles user info extraction internally)
      const user = await this.authService.createOrUpdateUserFromToken(providerToken, provider);
      
      // Generate internal JWT token
      const internalToken = await this._generateInternalToken(user);
      
      // Extract expiration time from the generated token with 5-minute safety buffer
      const expiresIn = await this._extractExpirationTime(internalToken);
      
      return {
        internalToken,
        expiresIn
      };
    } catch (error) {
      // Re-throw TRPCErrors (like EmailConflictException) to preserve error codes and messages
      if (error instanceof TRPCError) {
        throw error;
      }
      
      // Wrap other errors in a generic error message
      throw new Error(`Token exchange failed: ${(error as Error).message}`);
    }
  }
  
  /* ========================================
   * Private Methods
   * ======================================== */
  
  /**
   * Validate the external provider token and extract user information
   * 
   * @param token - The access token from the external provider
   * @param provider - The provider type
   * @returns Promise<TokenPayload> - The validated token payload
   * @throws Error if token validation fails
   */
  private async _validateExternalToken(token: string, provider: ExternalAuthProvider) {
    const authProvider = AuthProviderFactory.create(provider);
    return await authProvider.verifyToken(token);
  }
  
  /**
   * Generate an internal JWT token for the authenticated user
   * 
   * @param user - The authenticated user
   * @returns Promise<string> - The generated JWT token
   * @throws Error if token generation fails
   */
  private async _generateInternalToken(user: User): Promise<string> {
    return await this.jwtService.createToken({
      userId: user.id,
      email: user.email,
      name: user.name || user.email.split("@")[0], // Use email prefix if name is null
      tenantId: user.tenantId
    });
  }
  
  /**
   * Extract the expiration time from the generated JWT token with safety buffer
   * 
   * This method verifies the token to extract the 'exp' claim, then calculates
   * the time until expiration minus a 5-minute safety buffer.
   * 
   * @param token - The generated JWT token
   * @returns Promise<number> - Time until expiration in seconds (with 5-min buffer)
   */
  private async _extractExpirationTime(token: string): Promise<number> {
    // Verify the token to extract the payload with exp claim
    const payload = await this.jwtService.verifyToken(token);
    
    // Extract exp claim (Unix timestamp in seconds)
    const expiration = payload.exp;
    const currentTime = Math.floor(Date.now() / 1000); // Current time in Unix seconds
    
    // Calculate seconds until expiration with 5-minute (300 seconds) safety buffer
    const timeUntilExpiration = expiration - currentTime;
    const safetyBuffer = 5 * 60; // 5 minutes in seconds
    
    return Math.max(0, timeUntilExpiration - safetyBuffer);
  }
}