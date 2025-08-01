// Type exports
export type { GoogleConfig } from './google.config.ts';
export type { GitHubConfig } from './github.config.ts';
export type { JWTConfig } from './jwt.config.ts';
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
 * Gets environment variable with default value
 */
function getEnvWithDefault(name: string, defaultValue: string): string {
  return Deno.env.get(name) ?? defaultValue;
}

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  google: {
    oidcMetadataUrl: getRequiredEnv('GOOGLE_OIDC_METADATA_URL'),
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_SECRET'),
    redirectUriBase: getRequiredEnv('GOOGLE_REDIRECT_URI_BASE'),
  },
  github: {
    clientId: getRequiredEnv('GITHUB_CLIENT_ID'),
    clientSecret: getRequiredEnv('GITHUB_SECRET'),
    redirectUriBase: getRequiredEnv('GITHUB_REDIRECT_URI_BASE'),
  },
  jwt: {
    signingKey: getRequiredEnv('JWT_SIGNING_KEY'),
    accessTokenExpiry: getEnvWithDefault('JWT_ACCESS_TOKEN_EXPIRY', '24h'),
    issuer: getEnvWithDefault('JWT_ISSUER', 'taskman-backend'),
    audience: getEnvWithDefault('JWT_AUDIENCE', 'taskman-cli'),
  },
};