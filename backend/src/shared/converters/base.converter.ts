/**
 * Base Converter Interface
 * 
 * Provides a standardized interface for bidirectional conversion between domain models 
 * and Prisma entities. This ensures type safety and consistency across all converters 
 * in the application.
 * 
 * The converter pattern separates domain logic from persistence concerns, allowing for:
 * - Clean separation between domain models and database entities
 * - Type-safe conversion with compile-time guarantees
 * - Consistent conversion patterns across the application
 * - Easy testing and mocking of conversion logic
 */
export interface BaseConverter<TDomain, TPrisma> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma entity to a domain model
   * 
   * Takes the raw Prisma entity data and transforms it into a clean domain model
   * that can be safely used throughout the application layer. This method should
   * handle any necessary field transformations, type conversions, or computed
   * properties that exist in the domain model but not in the database.
   * 
   * @param prismaEntity - The Prisma entity to convert
   * @returns The corresponding domain model
   * @throws {Error} When conversion fails due to invalid or malformed data
   * 
   * @example
   * ```typescript
   * const userDomain = converter.toDomain(prismaUser);
   * console.log(userDomain.id); // Clean domain object ready for business logic
   * ```
   */
  toDomain(prismaEntity: TPrisma): TDomain;

  /**
   * Converts a domain model to a Prisma entity format
   * 
   * Takes a domain model and transforms it into the format expected by Prisma
   * for database operations. This method should handle reverse transformations,
   * flattening nested objects, and preparing data for persistence.
   * 
   * @param domainModel - The domain model to convert
   * @returns The corresponding Prisma entity format
   * @throws {Error} When conversion fails due to invalid domain model
   * 
   * @example
   * ```typescript
   * const prismaData = converter.toPrisma(userDomain);
   * await prisma.user.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: TDomain): TPrisma;

  /* ========================================
   * Array Conversion Methods
   * ======================================== */

  /**
   * Converts an array of Prisma entities to domain models
   * 
   * Efficiently processes multiple Prisma entities in a single operation,
   * converting each one to its corresponding domain model. This method
   * provides batch conversion functionality for improved performance
   * when dealing with collections.
   * 
   * @param prismaEntities - Array of Prisma entities to convert
   * @returns Array of corresponding domain models
   * @throws {Error} When any conversion in the array fails
   * 
   * @example
   * ```typescript
   * const users = await prisma.user.findMany();
   * const userDomains = converter.toDomainArray(users);
   * // Process array of clean domain objects
   * ```
   */
  toDomainArray(prismaEntities: TPrisma[]): TDomain[];

  /**
   * Converts an array of domain models to Prisma entity format
   * 
   * Efficiently processes multiple domain models for batch database operations.
   * This method is particularly useful for bulk insert/update operations
   * where multiple entities need to be prepared for persistence.
   * 
   * @param domainModels - Array of domain models to convert
   * @returns Array of corresponding Prisma entity formats
   * @throws {Error} When any conversion in the array fails
   * 
   * @example
   * ```typescript
   * const prismaData = converter.toPrismaArray(userDomains);
   * await prisma.user.createMany({ data: prismaData });
   * ```
   */
  toPrismaArray(domainModels: TDomain[]): TPrisma[];
}