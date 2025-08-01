import { type Prisma } from "../../generated/prisma/client.ts";

/**
 * Base Repository
 * 
 * Generic repository base class providing standard CRUD operations with full type safety.
 * Uses 4 generic arguments to work seamlessly with Prisma's type system:
 * - T: Entity model type (User, Tenant, Assignee)
 * - TCreateInput: Prisma's create input type  
 * - TUpdateInput: Prisma's update input type
 * - TDelegate: Prisma's delegate type
 * 
 * This eliminates code duplication while maintaining proper TypeScript inference.
 * Supports transactions through optional tx parameter in all methods.
 */
export abstract class BaseRepository<
  T,
  TCreateInput,
  TUpdateInput,
  TDelegate extends {
    findFirst: (args: any) => Promise<T | null>;
    create: (args: any) => Promise<T>;
    update: (args: any) => Promise<T>;
  }
> {
  
  /* ========================================
   * Abstract Methods
   * ======================================== */

  /**
   * Concrete repositories must provide their specific Prisma delegate
   * Supports both regular operations and transactions
   * Example: protected getDelegate(tx?: Prisma.TransactionClient) { return tx?.user ?? prisma.user; }
   */
  protected abstract getDelegate(tx?: Prisma.TransactionClient): TDelegate;

  /* ========================================
   * Standard CRUD Operations
   * ======================================== */

  /**
   * Find an entity by ID
   * Automatically filters out soft-deleted records
   */
  async getById(id: string, tx?: Prisma.TransactionClient): Promise<T | null> {
    return await this.getDelegate(tx).findFirst({
      where: {
        id,
        deletedAt: null
      }
    });
  }

  /**
   * Create a new entity
   */
  async create(data: TCreateInput, tx?: Prisma.TransactionClient): Promise<T> {
    return await this.getDelegate(tx).create({
      data
    });
  }

  /**
   * Update an existing entity
   */
  async update(id: string, data: TUpdateInput, tx?: Prisma.TransactionClient): Promise<T> {
    return await this.getDelegate(tx).update({
      where: { id },
      data
    });
  }

  /**
   * Soft delete an entity by setting deletedAt timestamp
   */
  async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    await this.getDelegate(tx).update({
      where: { id },
      data: { 
        deletedAt: new Date() 
      }
    });
  }
}