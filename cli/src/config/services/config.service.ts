import type { TRPCClient } from "@trpc/client";
import type { ClientConfig, TaskmanRouter } from "@taskman/backend";
import { TrpcClientFactory } from "../../trpc/factory/trpc-client.factory.ts";

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
      this.client = await TrpcClientFactory.create();
    } 
    // Fetch remote client config
    return await this.client.config.clientConfig.query();
  }
}