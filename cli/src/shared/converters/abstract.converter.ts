import { BaseCliConverter } from './base.converter.ts';

/**
 * Abstract CLI Converter Class
 * 
 * Provides a standardized implementation of common converter patterns while extending
 * the BaseCliConverter interface. This abstract class eliminates code duplication by
 * implementing shared array conversion logic with consistent error handling.
 * 
 * Key features:
 * - Standardized array conversion methods with proper error handling
 * - Consistent error message formatting across all converters
 * - Type-safe implementation with generic type parameters
 * - Elimination of duplicate array processing logic
 * - Leverages TypeScript's type system for compile-time safety
 * 
 * Concrete converter classes should extend this class and implement only the
 * fromSerialized() and toSerialized() methods for single entity conversion.
 */
export abstract class AbstractCliConverter<TDomain, TSerialized> implements BaseCliConverter<TDomain, TSerialized> {

  /* ========================================
   * Abstract Methods (Must be implemented by subclasses)
   * ======================================== */

  /**
   * Converts serialized data to a domain model
   * 
   * This method must be implemented by concrete converter classes to handle
   * the specific conversion logic for their entity types. The abstract base
   * class provides the array conversion wrapper around this method.
   * 
   * @param serializedData - The serialized data to convert
   * @returns The corresponding domain model
   * @throws {Error} When conversion fails due to invalid or malformed data
   */
  abstract fromSerialized(serializedData: TSerialized): TDomain;

  /**
   * Converts a domain model to serialized format
   * 
   * This method must be implemented by concrete converter classes to handle
   * the specific conversion logic for their entity types. The abstract base
   * class provides the array conversion wrapper around this method.
   * 
   * @param domainModel - The domain model to convert
   * @returns The corresponding serialized format
   * @throws {Error} When conversion fails due to invalid domain model
   */
  abstract toSerialized(domainModel: TDomain): TSerialized;

  /* ========================================
   * Shared Array Conversion Implementation
   * ======================================== */

  /**
   * Converts an array of serialized data to domain models
   * 
   * Provides standardized array conversion with proper error handling and
   * validation. This implementation eliminates code duplication across all
   * converter classes by providing a common array processing pattern.
   * 
   * Features:
   * - Input validation to ensure proper array type
   * - Individual entity conversion with detailed error context
   * - Consistent error message formatting with entity index information
   * - Type-safe operation with generic type parameters
   * 
   * @param serializedArray - Array of serialized data to convert
   * @returns Array of corresponding domain models
   * @throws {Error} When input is not an array or any conversion fails
   * 
   * @example
   * ```typescript
   * const userResponses = await trpcClient.users.list.query();
   * const userDomains = userConverter.fromSerializedArray(userResponses);
   * // Returns array of clean domain objects
   * ```
   */
  fromSerializedArray(serializedArray: TSerialized[]): TDomain[] { 
    // Convert each entity with detailed error context
    return serializedArray.map((entity, index) => {
      try {
        return this.fromSerialized(entity);
      } catch (error) {
        // Extract error message safely, handling both Error objects and other types
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to convert ${this.getEntityTypeName()} entity at index ${index}: ${errorMessage}`
        );
      }
    });
  }

  /**
   * Converts an array of domain models to serialized format
   * 
   * Provides standardized array conversion for batch operations.
   * This implementation ensures consistent error handling and validation
   * patterns across all converter implementations.
   * 
   * Features:
   * - Input validation to ensure proper array type
   * - Individual model conversion with detailed error context
   * - Consistent error message formatting with model index information
   * - Type-safe operation with generic type parameters
   * 
   * @param domainModels - Array of domain models to convert
   * @returns Array of corresponding serialized formats
   * @throws {Error} When input is not an array or any conversion fails
   * 
   * @example
   * ```typescript
   * const userDomains: User[] = [user1, user2, user3];
   * const serialized = userConverter.toSerializedArray(userDomains);
   * // Array of serialized user data
   * ```
   */ 
  toSerializedArray(domainModels: TDomain[]): TSerialized[] {
    // Convert each model with detailed error context
    return domainModels.map((model, index) => {
      try {
        return this.toSerialized(model);
      } catch (error) {
        // Extract error message safely, handling both Error objects and other types
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to convert ${this.getEntityTypeName()} domain model at index ${index}: ${errorMessage}`
        );
      }
    });
  }

  /* ========================================
   * Helper Methods
   * ======================================== */

  /**
   * Gets the entity type name for error messages
   * 
   * Provides a consistent way to identify the entity type in error messages.
   * Concrete converter classes should override this method to return their
   * specific entity type name (e.g., 'User', 'Task', 'Assignee').
   * 
   * @returns The entity type name used in error messages
   * 
   * @example
   * ```typescript
   * // In UserConverter class:
   * protected getEntityTypeName(): string {
   *   return 'User';
   * }
   * ```
   */
  protected getEntityTypeName(): string {
    // Default implementation extracts class name and removes 'Converter' suffix
    const className = this.constructor.name;
    return className.replace('Converter', '');
  }
}
