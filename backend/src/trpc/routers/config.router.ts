import { router, publicProcedure } from "../index.ts";
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
      }
    }
  }))
});