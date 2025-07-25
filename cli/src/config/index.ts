export type { AppConfig } from './app.config.ts';
export type { BackendConfig } from './backend.config.ts';
export type { SessionConfig } from './session.config.ts';
export { ConfigService } from './services/config.service.ts';

import type { AppConfig } from './app.config.ts';
import { ConfigService } from "./services/config.service.ts";

/**
 * Gets environment variable with fallback
 */
function getEnv(name: string, defaultValue: string): string {
  return Deno.env.get(name) || defaultValue;
}

/**
 * Application configuration loaded from environment variables
 */
export const config: AppConfig = {
  backend: {
    url: getEnv('TASKMAN_SERVER_URL', 'https://taskman.bbenetti.ca'),
  },
  session: {
    filePath: getEnv('TASKMAN_SESSION_PATH', '~/.taskman/.session'),
  },
  client: await new ConfigService().load()
};