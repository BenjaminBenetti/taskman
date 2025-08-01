import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { config } from "../../config/index.ts";
import { type InternalJWTPayload } from "../interfaces/internal-jwt-payload.interface.ts";


/**
 * JWT Service
 * 
 * Handles JWT token creation and verification for internal authentication.
 * Uses the jose library for secure JWT operations with HS256 signing.
 * Implements proper validation of issuer, audience, and expiration claims.
 */
export class JWTService {
  /* ========================================
   * Private Properties
   * ======================================== */
  
  private readonly _signingKey: Uint8Array;
  
  /* ========================================
   * Constructor
   * ======================================== */
  
  constructor() {
    this._validateSigningKey();
    this._signingKey = new TextEncoder().encode(config.jwt.signingKey);
  }
  
  /* ========================================
   * Public Methods
   * ======================================== */
  
  /**
   * Creates a signed JWT token with the provided payload data
   * 
   * @param payload - The token payload data including user and tenant information
   * @param payload.userId - The user ID (becomes 'sub' claim)
   * @param payload.email - The user email
   * @param payload.name - The user display name
   * @param payload.tenantId - The tenant ID for multi-tenant isolation
   * @returns Promise<string> - The signed JWT token string
   * @throws Error if token creation fails or required payload fields are missing
   */
  async createToken(payload: {
    userId: string;
    email: string;
    name: string;
    tenantId: string;
  }): Promise<string> {
    try {
      // Validate required payload fields
      this._validateTokenPayload(payload);
      
      // Create JWT with jose library
      const jwt = await new SignJWT({
        email: payload.email,
        name: payload.name,
        tenantId: payload.tenantId,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.userId)
        .setIssuer(config.jwt.issuer)
        .setAudience(config.jwt.audience)
        .setIssuedAt()
        .setExpirationTime(config.jwt.accessTokenExpiry)
        .sign(this._signingKey);
      
      return jwt;
    } catch (error) {
      throw new Error(`JWT token creation failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Verifies a JWT token and returns the decoded payload
   * 
   * @param token - The JWT token string to verify
   * @returns Promise<InternalJWTPayload> - The verified and decoded token payload
   * @throws Error if token is invalid, expired, or verification fails
   */
  async verifyToken(token: string): Promise<InternalJWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this._signingKey, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
      
      // Validate payload structure
      this._validateVerifiedPayload(payload);
      
      return payload as InternalJWTPayload;
    } catch (error) {
      throw new Error(`JWT token verification failed: ${(error as Error).message}`);
    }
  }
  
  /* ========================================
   * Private Methods
   * ======================================== */
  
  /**
   * Validates that the JWT signing key meets security requirements
   * 
   * @throws Error if signing key is missing or too short for security
   */
  private _validateSigningKey(): void {
    if (!config.jwt.signingKey) {
      throw new Error("JWT signing key is required but not configured");
    }
    
    if (config.jwt.signingKey.length < 32) {
      throw new Error("JWT signing key must be at least 32 characters for security");
    }
  }
  
  /**
   * Validates token creation payload has all required fields
   * 
   * @param payload - The payload data to validate
   * @throws Error if required fields are missing or invalid
   */
  private _validateTokenPayload(payload: {
    userId: string;
    email: string;
    name: string;
    tenantId: string;
  }): void {
    if (!payload.userId?.trim()) {
      throw new Error("User ID is required for JWT token creation");
    }
    
    if (!payload.email?.trim()) {
      throw new Error("Email is required for JWT token creation");
    }
    
    if (!payload.name?.trim()) {
      throw new Error("Name is required for JWT token creation");
    }
    
    if (!payload.tenantId?.trim()) {
      throw new Error("Tenant ID is required for JWT token creation");
    }
  }
  
  /**
   * Validates that verified JWT payload contains all required claims
   * 
   * @param payload - The decoded JWT payload to validate
   * @throws Error if required claims are missing
   */
  private _validateVerifiedPayload(payload: JWTPayload): void {
    if (!payload.sub) {
      throw new Error("Invalid JWT: missing subject (sub) claim");
    }
    
    if (!payload.iss) {
      throw new Error("Invalid JWT: missing issuer (iss) claim");
    }
    
    if (!payload.aud) {
      throw new Error("Invalid JWT: missing audience (aud) claim");
    }
    
    if (!payload.email) {
      throw new Error("Invalid JWT: missing email claim");
    }
    
    if (!payload.name) {
      throw new Error("Invalid JWT: missing name claim");
    }
    
    if (!payload.tenantId) {
      throw new Error("Invalid JWT: missing tenantId claim");
    }
  }
}