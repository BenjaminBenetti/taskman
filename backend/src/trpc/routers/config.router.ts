import { router } from "../index.ts";
import { publicProcedure } from "../middleware/publicProcedure.ts";
import { config } from "../../config/index.ts";
import type { ClientConfig } from "../../config/client/index.ts";

/**
 * Configuration router providing public client configuration
 */
export const configRouter = router({
  /**
   * Returns client configuration
   */
  clientConfig: publicProcedure.query((): ClientConfig => ({
    auth: {
      google: {
        clientId: config.google.clientId,
        redirectUriBase: config.google.redirectUriBase,
        scopes: ['openid', 'profile', 'email']
      },
      github: {
        clientId: config.github.clientId,
        redirectUriBase: config.github.redirectUriBase,
        scopes: ['user:email', 'read:user']
      }
    }
  }))
});