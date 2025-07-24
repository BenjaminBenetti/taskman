import type { AuthClientConfig } from './auth-client.config.ts';

/**
 * Complete client configuration object
 */
export interface ClientConfig {
  /** Authentication configuration */
  auth: AuthClientConfig;
}