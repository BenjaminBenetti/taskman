import { type JWTPayload } from "jose";

/**
 * Internal JWT Token Payload
 * 
 * Extends the standard JWT payload with application-specific claims
 * for internal authentication within the TaskMan system.
 */
export interface InternalJWTPayload extends JWTPayload {
  /** Subject (user ID) */
  sub: string;
  /** Issuer */
  iss: string;
  /** Audience */
  aud: string;
  /** User email */
  email: string;
  /** User display name */
  name: string;
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Issued at timestamp */
  iat: number;
  /** Expiration timestamp */
  exp: number;
}