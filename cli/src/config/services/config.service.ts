import type { TRPCClient } from "@trpc/client";
import type { ClientConfig, TaskmanRouter } from "@taskman/backend";
import { TrpcClientFactory } from "../../trpc/factory/trpc-client.factory.ts";

/**
 * Service for managing configuration
 */
export class ConfigService {
  // ============================================================================
  // Properties
  // ============================================================================
  
  private client: TRPCClient<TaskmanRouter>;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor() {
    this.client = TrpcClientFactory.create();
  }

  // ============================================================================
  // Public methods
  // ============================================================================

  /**
   * Loads client configuration from server. and updates global config object.
   */
  async load(): Promise<ClientConfig> {
    // Fetch remote client config
    return await this.client.config.clientConfig.query();
  }
}