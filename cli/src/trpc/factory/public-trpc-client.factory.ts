import { createTRPCClient, httpBatchLink, type TRPCClient } from "@trpc/client";
import type { TaskmanRouter } from "@taskman/backend";

/**
 * Factory for creating unauthenticated TRPC clients
 */
export class PublicTrpcClientFactory {
  // ================================================
  // Static methods
  // ================================================

  /**
   * Creates a new unauthenticated TRPC client instance
   * @param serverUrl - The server URL to connect to
   * @returns A configured TRPC client without authentication headers
   */
  static create(serverUrl?: string): TRPCClient<TaskmanRouter> {
    const url = serverUrl || Deno.env.get('TASKMAN_SERVER_URL') || 'https://taskman.bbenetti.ca';
    
    return createTRPCClient<TaskmanRouter>({
      links: [
        httpBatchLink({
          url,
        }),
      ],
    });
  }
}