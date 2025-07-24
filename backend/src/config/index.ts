// Type exports
export type { GoogleConfig } from './google.config.ts';
export type { AppConfig } from './app.config.ts';

// Import types for config implementation
import type { AppConfig } from './app.config.ts';

/**
 * Gets required environment variable or throws error
 */
function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  google: {
    oidcMetadataUrl: getRequiredEnv('GOOGLE_OIDC_METADATA_URL'),
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    redirectUriBase: getRequiredEnv('GOOGLE_REDIRECT_URI_BASE'),
  },
};