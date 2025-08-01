import type { BackendConfig } from './backend.config.ts';
import type { SessionConfig } from './session.config.ts';
import type { ClientConfig } from '@taskman/backend';

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Backend server configuration */
  backend: BackendConfig;
  /** Client configuration from backend */
  client?: ClientConfig;
  /** Session storage configuration */
  session: SessionConfig;
}