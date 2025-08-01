import { AbstractConverter } from '../../shared/converters/abstract.converter.ts';
import { Assignee } from '../models/assignee.model.ts';
import { AssigneeModel } from '../../generated/prisma/models/Assignee.ts';

/**
 * Assignee Converter
 * 
 * Handles bidirectional conversion between Assignee domain models and Prisma entities.
 * Provides type-safe conversion methods for single entities and arrays, ensuring
 * consistent data transformation across the application.
 * 
 * Key responsibilities:
 * - Convert Prisma Assignee entities to clean domain models
 * - Transform domain models to Prisma-compatible format
 * - Handle nullable field mappings (email, phone, notes, deletedAt)
 * - Manage Date object conversions for timestamp fields
 * - Provide batch conversion capabilities for arrays
 */
export class AssigneeConverter extends AbstractConverter<Assignee, AssigneeModel> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma Assignee entity to an Assignee domain model
   * 
   * Transforms the raw database entity into a clean domain object suitable
   * for business logic operations. Handles proper type mapping for all fields
   * including nullable fields and Date conversions.
   * 
   * @param prismaEntity - The Prisma Assignee entity from database
   * @returns Clean Assignee domain model
   * @throws {Error} When prismaEntity is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const assigneeEntity = await prisma.assignee.findUnique({ where: { id: 'assignee-123' } });
   * const assigneeDomain = assigneeConverter.toDomain(assigneeEntity);
   * console.log(assigneeDomain.name); // Access clean domain properties
   * ```
   */
  toDomain(prismaEntity: AssigneeModel): Assignee {

    return {
      id: prismaEntity.id,
      name: prismaEntity.name,
      email: prismaEntity.email,
      phone: prismaEntity.phone,
      notes: prismaEntity.notes,
      isActive: prismaEntity.isActive,
      tenantId: prismaEntity.tenantId,
      creatorId: prismaEntity.creatorId,
      createdAt: new Date(prismaEntity.createdAt),
      updatedAt: new Date(prismaEntity.updatedAt),
      deletedAt: prismaEntity.deletedAt ? new Date(prismaEntity.deletedAt) : null,
    };
  }

  /**
   * Converts an Assignee domain model to Prisma entity format
   * 
   * Transforms a domain model into the structure expected by Prisma for
   * database operations. Ensures all required fields are present and
   * properly formatted for persistence.
   * 
   * @param domainModel - The Assignee domain model to convert
   * @returns Prisma-compatible Assignee entity format
   * @throws {Error} When domainModel is null, undefined, or missing required fields
   * 
   * @example
   * ```typescript
   * const newAssignee: Assignee = {
   *   id: 'assignee-123',
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   // ... other fields
   * };
   * const prismaData = assigneeConverter.toPrisma(newAssignee);
   * await prisma.assignee.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: Assignee): AssigneeModel {

    return {
      id: domainModel.id,
      name: domainModel.name,
      email: domainModel.email ?? null,
      phone: domainModel.phone ?? null,
      notes: domainModel.notes ?? null,
      isActive: domainModel.isActive,
      tenantId: domainModel.tenantId,
      creatorId: domainModel.creatorId,
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
   * identification for Assignee converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'Assignee';
  }
}

// =========================================
// Singleton Instance Export
// =========================================

/**
 * Singleton instance of AssigneeConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire application.
 * 
 * @example
 * ```typescript
 * import { assigneeConverter } from './assignee.converter.ts';
 * 
 * // Use singleton instance directly
 * const assigneeDomain = assigneeConverter.toDomain(prismaAssignee);
 * const prismaData = assigneeConverter.toPrisma(assigneeDomain);
 * ```
 */
export const assigneeConverter = new AssigneeConverter();