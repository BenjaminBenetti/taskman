/**
 * Token Exchange Result Interface
 * 
 * Defines the structure of the result returned from exchanging external
 * provider tokens for internal JWT tokens. Contains the generated internal
 * token and its expiration information.
 */
export interface TokenExchangeResult {
  /** The generated internal JWT token */
  internalToken: string;
  /** Token expiration time in seconds from now */
  expiresIn: number;
}