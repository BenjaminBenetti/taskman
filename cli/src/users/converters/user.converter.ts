import type { User } from "@taskman/backend";
import { AbstractCliConverter } from "../../shared/converters/abstract.converter.ts";

/**
 * Serialized User type representing how User objects are received from TRPC
 * (with dates as strings instead of Date objects)
 */
export interface SerializedUser {
  id: string;
  email: string;
  name: string | null;
  identityProvider: string;
  identityProviderId: string;
  tenantId: string;
  assigneeId: string;
  createdAt: string; // Date serialized as string
  updatedAt: string; // Date serialized as string
  deletedAt: string | null; // Date serialized as string or null
}

/**
 * User Converter for CLI
 * 
 * Handles conversion between serialized User objects (as received from TRPC)
 * and proper User domain models with Date objects. This follows the established
 * converter pattern used throughout the codebase by extending AbstractCliConverter.
 * 
 * Key responsibilities:
 * - Convert serialized User data from TRPC to proper domain models
 * - Handle Date string to Date object conversion
 * - Maintain type safety and consistency with backend converters
 * - Provide array conversion capabilities through AbstractCliConverter
 */
export class UserConverter extends AbstractCliConverter<User, SerializedUser> {
  
  /**
   * Converts a serialized User (from TRPC response) to a User domain model
   * 
   * Transforms the serialized user data received from TRPC into a clean domain
   * object with proper Date objects. This handles the conversion of date strings
   * back to Date objects as expected by the User interface.
   * 
   * @param serializedUser - The serialized User data from TRPC response
   * @returns Clean User domain model with proper Date objects
   * @throws {Error} When serializedUser is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const trpcResponse = await trpcClient.users.me.query();
   * const userDomain = userConverter.fromSerialized(trpcResponse);
   * console.log(userDomain.createdAt instanceof Date); // true
   * ```
   */
  fromSerialized(serializedUser: SerializedUser): User {
    if (!serializedUser) {
      throw new Error("Cannot convert null or undefined serialized user");
    }

    return {
      id: serializedUser.id,
      email: serializedUser.email,
      name: serializedUser.name,
      identityProvider: serializedUser.identityProvider,
      identityProviderId: serializedUser.identityProviderId,
      tenantId: serializedUser.tenantId,
      assigneeId: serializedUser.assigneeId,
      createdAt: new Date(serializedUser.createdAt),
      updatedAt: new Date(serializedUser.updatedAt),
      deletedAt: serializedUser.deletedAt ? new Date(serializedUser.deletedAt) : null,
    };
  }

  /**
   * Converts a User domain model to serialized format
   * 
   * Transforms a User domain model back to the serialized format with date
   * strings. This is useful for testing or when preparing data for transmission.
   * 
   * @param user - The User domain model to serialize
   * @returns Serialized User with date strings
   * @throws {Error} When user is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const userDomain: User = { ... };
   * const serialized = userConverter.toSerialized(userDomain);
   * console.log(typeof serialized.createdAt); // "string"
   * ```
   */
  toSerialized(user: User): SerializedUser {
    if (!user) {
      throw new Error("Cannot convert null or undefined user");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      identityProvider: user.identityProvider,
      identityProviderId: user.identityProviderId,
      tenantId: user.tenantId,
      assigneeId: user.assigneeId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
    };
  }

  /**
   * Provides the entity type name for error messages
   * 
   * Overrides the base class method to provide specific entity type
   * identification for User converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'User';
  }
}

/**
 * Singleton instance of UserConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire CLI application.
 * 
 * @example
 * ```typescript
 * import { userConverter } from './user.converter.ts';
 * 
 * // Use singleton instance directly
 * const userDomain = userConverter.fromSerialized(trpcResponse);
 * ```
 */
export const userConverter = new UserConverter();
