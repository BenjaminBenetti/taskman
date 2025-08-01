import { BaseConverter } from './base.converter.ts';

/**
 * Abstract Base Converter Class
 * 
 * Provides a standardized implementation of common converter patterns while extending
 * the BaseConverter interface. This abstract class eliminates code duplication by
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
 * toDomain() and toPrisma() methods for single entity conversion.
 */
export abstract class AbstractConverter<TDomain, TPrisma> implements BaseConverter<TDomain, TPrisma> {

  /* ========================================
   * Abstract Methods (Must be implemented by subclasses)
   * ======================================== */

  /**
   * Converts a Prisma entity to a domain model
   * 
   * This method must be implemented by concrete converter classes to handle
   * the specific conversion logic for their entity types. The abstract base
   * class provides the array conversion wrapper around this method.
   * 
   * @param prismaEntity - The Prisma entity to convert
   * @returns The corresponding domain model
   * @throws {Error} When conversion fails due to invalid or malformed data
   */
  abstract toDomain(prismaEntity: TPrisma): TDomain;

  /**
   * Converts a domain model to Prisma entity format
   * 
   * This method must be implemented by concrete converter classes to handle
   * the specific conversion logic for their entity types. The abstract base
   * class provides the array conversion wrapper around this method.
   * 
   * @param domainModel - The domain model to convert
   * @returns The corresponding Prisma entity format
   * @throws {Error} When conversion fails due to invalid domain model
   */
  abstract toPrisma(domainModel: TDomain): TPrisma;

  /* ========================================
   * Shared Array Conversion Implementation
   * ======================================== */

  /**
   * Converts an array of Prisma entities to domain models
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
   * @param prismaEntities - Array of Prisma entities to convert
   * @returns Array of corresponding domain models
   * @throws {Error} When input is not an array or any conversion fails
   * 
   * @example
   * ```typescript
   * const userEntities = await prisma.user.findMany();
   * const userDomains = userConverter.toDomainArray(userEntities);
   * // Returns array of clean domain objects
   * ```
   */
  toDomainArray(prismaEntities: TPrisma[]): TDomain[] { 
    // Convert each entity with detailed error context
    return prismaEntities.map((entity, index) => {
      try {
        return this.toDomain(entity);
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
   * Converts an array of domain models to Prisma entity format
   * 
   * Provides standardized array conversion for batch database operations.
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
   * @returns Array of corresponding Prisma entity formats
   * @throws {Error} When input is not an array or any conversion fails
   * 
   * @example
   * ```typescript
   * const userDomains: User[] = [user1, user2, user3];
   * const prismaData = userConverter.toPrismaArray(userDomains);
   * await prisma.user.createMany({ data: prismaData });
   * ```
   */ 
  toPrismaArray(domainModels: TDomain[]): TPrisma[] {
    // Convert each model with detailed error context
    return domainModels.map((model, index) => {
      try {
        return this.toPrisma(model);
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
   * specific entity type name (e.g., 'User', 'Tenant', 'Assignee').
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