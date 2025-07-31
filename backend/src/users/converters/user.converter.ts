import { AbstractConverter } from '../../shared/converters/abstract.converter.ts';
import { User } from '../models/user.model.ts';
import { UserModel } from '../../generated/prisma/models/User.ts';

/**
 * User Converter
 * 
 * Handles bidirectional conversion between User domain models and Prisma entities.
 * Provides type-safe conversion methods for single entities and arrays, ensuring
 * consistent data transformation across the application.
 * 
 * Key responsibilities:
 * - Convert Prisma User entities to clean domain models
 * - Transform domain models to Prisma-compatible format
 * - Handle nullable field mappings (name, deletedAt)
 * - Manage Date object conversions for timestamp fields
 * - Provide batch conversion capabilities for arrays
 */
export class UserConverter extends AbstractConverter<User, UserModel> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma User entity to a User domain model
   * 
   * Transforms the raw database entity into a clean domain object suitable
   * for business logic operations. Handles proper type mapping for all fields
   * including nullable fields and Date conversions.
   * 
   * @param prismaEntity - The Prisma User entity from database
   * @returns Clean User domain model
   * @throws {Error} When prismaEntity is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const userEntity = await prisma.user.findUnique({ where: { id: 'user-123' } });
   * const userDomain = userConverter.toDomain(userEntity);
   * console.log(userDomain.email); // Access clean domain properties
   * ```
   */
  toDomain(prismaEntity: UserModel): User {

    return {
      id: prismaEntity.id,
      email: prismaEntity.email,
      name: prismaEntity.name,
      identityProvider: prismaEntity.identityProvider,
      identityProviderId: prismaEntity.identityProviderId,
      tenantId: prismaEntity.tenantId,
      assigneeId: prismaEntity.assigneeId,
      createdAt: new Date(prismaEntity.createdAt),
      updatedAt: new Date(prismaEntity.updatedAt),
      deletedAt: prismaEntity.deletedAt ? new Date(prismaEntity.deletedAt) : null,
    };
  }

  /**
   * Converts a User domain model to Prisma entity format
   * 
   * Transforms a domain model into the structure expected by Prisma for
   * database operations. Ensures all required fields are present and
   * properly formatted for persistence.
   * 
   * @param domainModel - The User domain model to convert
   * @returns Prisma-compatible User entity format
   * @throws {Error} When domainModel is null, undefined, or missing required fields
   * 
   * @example
   * ```typescript
   * const newUser: User = {
   *   id: 'user-123',
   *   email: 'user@example.com',
   *   // ... other fields
   * };
   * const prismaData = userConverter.toPrisma(newUser);
   * await prisma.user.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: User): UserModel {
    return {
      id: domainModel.id,
      email: domainModel.email,
      name: domainModel.name ?? null,
      identityProvider: domainModel.identityProvider,
      identityProviderId: domainModel.identityProviderId,
      tenantId: domainModel.tenantId,
      assigneeId: domainModel.assigneeId,
      createdAt: domainModel.createdAt,
      updatedAt: domainModel.updatedAt,
      deletedAt: domainModel.deletedAt ?? null,
    };
  }

  /* ========================================
   * Entity Type Name Override
   * ======================================== */

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

// =========================================
// Singleton Instance Export
// =========================================

/**
 * Singleton instance of UserConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire application.
 * 
 * @example
 * ```typescript
 * import { userConverter } from './user.converter.ts';
 * 
 * // Use singleton instance directly
 * const userDomain = userConverter.toDomain(prismaUser);
 * const prismaData = userConverter.toPrisma(userDomain);
 * ```
 */
export const userConverter = new UserConverter();