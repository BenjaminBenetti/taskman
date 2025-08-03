import { TRPCError } from "@trpc/server";

/**
 * Email Conflict Exception
 * 
 * Custom exception for handling email conflicts during authentication.
 * Thrown when a user attempts to sign up with an email that already exists
 * with a different identity provider.
 * 
 * Extends TRPCError with CONFLICT status code to provide proper HTTP semantics
 * and clear user-facing error messages about which provider they should use.
 */
export class EmailConflictException extends TRPCError {
  
  /* ========================================
   * Constructor
   * ======================================== */

  /**
   * Create a new EmailConflictException
   * 
   * @param email - The conflicting email address
   * @param existingProvider - The identity provider the email is already registered with
   * @param attemptedProvider - The identity provider the user tried to use
   */
  constructor(
    email: string,
    existingProvider: string,
    attemptedProvider: string
  ) {
    const message = `Account already exists with ${EmailConflictException._formatProviderName(existingProvider)}. Please sign in using ${EmailConflictException._formatProviderName(existingProvider)} instead.`;
    
    super({
      code: 'CONFLICT',
      message,
      cause: {
        email,
        existingProvider,
        attemptedProvider
      }
    });
  }

  /* ========================================
   * Private Helper Methods
   * ======================================== */

  /**
   * Format provider name for user-friendly display
   * 
   * @param provider - The provider name to format
   * @returns Capitalized provider name
   */
  private static _formatProviderName(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}