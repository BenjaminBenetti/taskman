import { AbstractConverter } from '../../shared/converters/abstract.converter.ts';
import type { Tenant } from '../models/tenant.model.ts';
import type { Tenant as PrismaTenant } from '../../generated/prisma/client.ts';

/**
 * TenantConverter Class
 * 
 * Implements the BaseConverter interface to provide standardized conversion
 * between Tenant domain models and Prisma entities. This converter ensures
 * that all data transformations maintain consistency and type safety.
 */
export class TenantConverter extends AbstractConverter<Tenant, PrismaTenant> {

  /* ========================================
   * Single Entity Conversion
   * ======================================== */

  /**
   * Converts a Prisma Tenant entity to a domain model
   * 
   * Transforms the raw Prisma entity data into a clean domain model that can be
   * safely used throughout the application layer. Handles proper Date object
   * conversion and null value normalization.
   * 
   * @param prismaEntity - The Prisma Tenant entity to convert
   * @returns The corresponding Tenant domain model
   * @throws {Error} When conversion fails due to invalid or malformed data
   * 
   * @example
   * ```typescript
   * const prismaTenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
   * const tenantDomain = tenantConverter.toDomain(prismaTenant);
   * console.log(tenantDomain.name); // Clean domain object ready for business logic
   * ```
   */
  toDomain(prismaEntity: PrismaTenant): Tenant {
    return {
      id: prismaEntity.id,
      name: prismaEntity.name,
      description: prismaEntity.description,
      createdAt: new Date(prismaEntity.createdAt),
      updatedAt: new Date(prismaEntity.updatedAt),
      deletedAt: prismaEntity.deletedAt ? new Date(prismaEntity.deletedAt) : null,
    };
  }

  /**
   * Converts a Tenant domain model to a Prisma entity format
   * 
   * Transforms a domain model into the format expected by Prisma for database
   * operations. Handles Date object serialization and prepares data for persistence.
   * 
   * @param domainModel - The Tenant domain model to convert
   * @returns The corresponding Prisma entity format
   * @throws {Error} When conversion fails due to invalid domain model
   * 
   * @example
   * ```typescript
   * const tenantDomain: Tenant = {
   *   id: 'tenant-123',
   *   name: 'Acme Corp',
   *   description: 'Our main tenant',
   *   createdAt: new Date(),
   *   updatedAt: new Date(),
   *   deletedAt: null
   * };
   * const prismaData = tenantConverter.toPrisma(tenantDomain);
   * await prisma.tenant.create({ data: prismaData });
   * ```
   */
  toPrisma(domainModel: Tenant): PrismaTenant {
    

    return {
      id: domainModel.id,
      name: domainModel.name,
      description: domainModel.description ?? null,
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
   * identification for Tenant converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'Tenant';
  }
}

/* ========================================
 * Singleton Instance Export
 * ======================================== */

/**
 * Pre-configured singleton instance of TenantConverter
 * 
 * This singleton instance provides a convenient way to access the tenant
 * converter throughout the application without needing to instantiate
 * the class multiple times. Use this instance for all tenant conversion
 * operations to ensure consistency.
 * 
 * @example
 * ```typescript
 * import { tenantConverter } from './tenant.converter.ts';
 * 
 * const tenantDomain = tenantConverter.toDomain(prismaTenant);
 * const prismaData = tenantConverter.toPrisma(tenantDomain);
 * ```
 */
export const tenantConverter = new TenantConverter();