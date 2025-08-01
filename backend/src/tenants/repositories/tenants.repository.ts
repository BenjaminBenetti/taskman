import type { Tenant } from "../models/tenant.model.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { BaseRepository } from "../../shared/repositories/base.repository.ts";
import { prisma } from "../../prisma/index.ts";

/**
 * Tenants Repository
 * 
 * Repository for tenant entities extending BaseRepository for type-safe CRUD operations.
 * Provides tenant-specific query methods while inheriting standard CRUD from the base class.
 * Uses instance-based approach for better dependency injection and testing.
 */
export class TenantsRepository extends BaseRepository<
  Tenant,
  Prisma.TenantCreateInput,
  Prisma.TenantUpdateInput,
  Prisma.TenantDelegate
> {
  
  /* ========================================
   * Repository Configuration
   * ======================================== */

  protected getDelegate(tx?: Prisma.TransactionClient): Prisma.TenantDelegate {
    return tx?.tenant ?? prisma.tenant;
  }

  /* ========================================
   * Query Methods
   * ======================================== */

  // Add tenant-specific methods here as needed
}