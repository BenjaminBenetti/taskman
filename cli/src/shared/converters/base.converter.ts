/**
 * Base Converter Interface for CLI
 * 
 * Provides a standardized interface for converting between serialized data 
 * (as received from TRPC) and domain models. This ensures type safety and 
 * consistency across all CLI converters.
 * 
 * The converter pattern separates serialization concerns from domain logic, allowing for:
 * - Clean separation between serialized data and domain models
 * - Type-safe conversion with compile-time guarantees
 * - Consistent conversion patterns across the CLI application
 * - Easy testing and mocking of conversion logic
 */
export interface BaseCliConverter<TDomain, TSerialized> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts serialized data to a domain model
   * 
   * Takes the serialized data (typically from TRPC responses) and transforms 
   * it into a clean domain model that can be safely used throughout the 
   * application layer. This method should handle any necessary field 
   * transformations, type conversions (like date strings to Date objects), 
   * or computed properties.
   * 
   * @param serializedData - The serialized data to convert
   * @returns The corresponding domain model
   * @throws {Error} When conversion fails due to invalid or malformed data
   * 
   * @example
   * ```typescript
   * const userDomain = converter.fromSerialized(trpcResponse);
   * console.log(userDomain.createdAt instanceof Date); // true
   * ```
   */
  fromSerialized(serializedData: TSerialized): TDomain;

  /**
   * Converts a domain model to serialized format
   * 
   * Takes a domain model and transforms it into the serialized format.
   * This method is useful for testing, caching, or when preparing data 
   * for transmission back to the server.
   * 
   * @param domainModel - The domain model to convert
   * @returns The corresponding serialized format
   * @throws {Error} When conversion fails due to invalid domain model
   * 
   * @example
   * ```typescript
   * const serialized = converter.toSerialized(userDomain);
   * console.log(typeof serialized.createdAt); // "string"
   * ```
   */
  toSerialized(domainModel: TDomain): TSerialized;

  /* ========================================
   * Array Conversion Methods
   * ======================================== */

  /**
   * Converts an array of serialized data to domain models
   * 
   * Efficiently processes multiple serialized entities in a single operation,
   * converting each one to its corresponding domain model. This method
   * provides batch conversion functionality for improved performance
   * when dealing with collections.
   * 
   * @param serializedArray - Array of serialized data to convert
   * @returns Array of corresponding domain models
   * @throws {Error} When any conversion in the array fails
   * 
   * @example
   * ```typescript
   * const users = await trpcClient.users.list.query();
   * const userDomains = converter.fromSerializedArray(users);
   * // Process array of clean domain objects
   * ```
   */
  fromSerializedArray(serializedArray: TSerialized[]): TDomain[];

  /**
   * Converts an array of domain models to serialized format
   * 
   * Efficiently processes multiple domain models for batch operations.
   * This method is particularly useful for testing or when preparing
   * multiple entities for transmission.
   * 
   * @param domainModels - Array of domain models to convert
   * @returns Array of corresponding serialized formats
   * @throws {Error} When any conversion in the array fails
   * 
   * @example
   * ```typescript
   * const serialized = converter.toSerializedArray(userDomains);
   * // Array of serialized user data
   * ```
   */
  toSerializedArray(domainModels: TDomain[]): TSerialized[];
}
