import type { GoogleClientConfig } from './google-client.config.ts';

/**
 * Authentication configuration for client applications
 */
export interface AuthClientConfig {
  /** Google OAuth configuration */
  google: GoogleClientConfig;
}