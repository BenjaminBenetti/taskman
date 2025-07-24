import type { GoogleConfig } from './google.config.ts';

/**
 * Top-level application configuration interface
 */
export interface AppConfig {
  /** Google OAuth configuration */
  google: GoogleConfig;
}