import type { TRPCClient } from "@trpc/client";
import type { ClientConfig, TaskmanRouter } from "@taskman/backend";
import { PublicTrpcClientFactory } from "../../trpc/factory/public-trpc-client.factory.ts";

/**
 * Service for managing configuration
 */
export class ConfigService {
  // ================================================
  // Properties
  // ================================================
  
  private client?: TRPCClient<TaskmanRouter>;

  // ================================================
  // Public methods
  // ================================================

  /**
   * Loads client configuration from server. and updates global config object.
   */
  async load(): Promise<ClientConfig> {
    if (!this.client) {
      this.client = PublicTrpcClientFactory.create();
    } 
    // Fetch remote client config
    return await this.client.config.clientConfig.query();
  }
}