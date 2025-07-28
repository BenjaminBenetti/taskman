import type { GoogleConfig } from './google.config.ts';
import type { GitHubConfig } from './github.config.ts';

/**
 * Top-level application configuration interface
 */
export interface AppConfig {
  /** Google OAuth configuration */
  google: GoogleConfig;
  /** GitHub OAuth configuration */
  github: GitHubConfig;
}