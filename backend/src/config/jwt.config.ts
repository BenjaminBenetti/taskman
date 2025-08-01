/**
 * JWT Configuration Interface
 * 
 * Defines the configuration structure for JWT token management,
 * including signing keys, expiration times, and validation parameters.
 */
export interface JWTConfig {
  /** JWT signing key - must be at least 32 characters for security */
  signingKey: string;
  /** Access token expiration time (e.g., "24h", "1d", "15m") */
  accessTokenExpiry: string;
  /** JWT issuer identifier */
  issuer: string;
  /** JWT audience identifier */
  audience: string;
}