import { jwtVerify, createRemoteJWKSet } from "jose";
import type { AuthProvider, TokenPayload, UserInfo } from "../interfaces/auth-provider.interface.ts";
import { config } from "../../config/index.ts";

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
  
  private _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private _oidcMetadata: { jwks_uri: string } | null = null;
  
  /* ========================================
   * Constructor
   * ======================================== */
  
  constructor() {
    // JWKS will be initialized lazily when needed
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
      // Initialize JWKS if not already done
      await this._initializeJwks();
      
      if (!this._jwks) {
        throw new Error("JWKS not initialized");
      }
      
      const { payload } = await jwtVerify(token, this._jwks);
      
      if (!payload.sub || !payload.iss) {
        throw new Error("Invalid token: missing sub or iss claims");
      }
      
      return {
        sub: payload.sub as string,
        iss: payload.iss as string,
        email: payload.email as string | undefined,
        name: payload.name as string | undefined,
        ...payload
      };
    } catch (error) {
      throw new Error(`Token verification failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Gets user information from Google JWT token
   * 
   * @param token - The Google JWT token string
   * @returns Promise<UserInfo> - User information with guaranteed email
   * @throws Error if token verification fails or email is not available
   */
  async getUserInfoFromToken(token: string): Promise<UserInfo> {
    const payload = await this.verifyToken(token);
    
    if (!payload.email) {
      throw new Error("Email is required but not found in Google token payload");
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
   * Initializes the JWKS by fetching OIDC metadata and setting up the remote JWKS
   * 
   * @throws Error if OIDC metadata cannot be fetched or JWKS URI is missing
   */
  private async _initializeJwks(): Promise<void> {
    if (this._jwks) {
      return; // Already initialized
    }
    
    try {
      // Fetch OIDC metadata to get JWKS URI
      const response = await fetch(config.google.oidcMetadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch OIDC metadata: ${response.status} ${response.statusText}`);
      }
      
      this._oidcMetadata = await response.json();
      
      if (!this._oidcMetadata?.jwks_uri) {
        throw new Error("JWKS URI not found in OIDC metadata");
      }
      
      // Create remote JWKS for token verification
      this._jwks = createRemoteJWKSet(new URL(this._oidcMetadata.jwks_uri));
      
    } catch (error) {
      throw new Error(`JWKS initialization failed: ${(error as Error).message}`);
    }
  }
}