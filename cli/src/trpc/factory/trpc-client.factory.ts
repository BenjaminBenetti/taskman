import { createTRPCClient, httpBatchLink, type TRPCClient } from "@trpc/client";
import type { TaskmanRouter } from "@taskman/backend";
import { AuthServiceFactory } from "../../auth/factories/auth-service.factory.ts";

/**
 * Factory for creating authenticated TRPC clients
 */
export class TrpcClientFactory {
  // ================================================
  // Static methods
  // ================================================

  /**
   * Creates a new authenticated TRPC client instance
   * @param serverUrl - The server URL to connect to
   * @returns A configured TRPC client with authentication headers
   */
  static async create(serverUrl?: string): Promise<TRPCClient<TaskmanRouter>> {
    const url = serverUrl || Deno.env.get('TASKMAN_SERVER_URL') || 'https://taskman.bbenetti.ca';
    
    // Get current auth session and service for backend token selection
    const session = await AuthServiceFactory.getCurrentSession();
    const authService = await AuthServiceFactory.getCurrentService();
    
    const headers: Record<string, string> = {};
    
    if (session && authService) {
      // Use internal token if available, otherwise fallback to provider-specific token
      const backendToken = authService.getBackendToken(session);
      if (backendToken) {
        headers.Authorization = `Bearer ${backendToken}`;
      }
    }
    
    return createTRPCClient<TaskmanRouter>({
      links: [
        httpBatchLink({
          url,
          headers,
        }),
      ],
    });
  }
}