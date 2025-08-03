import { type Prisma } from "../../generated/prisma/client.ts";
import { BaseRepository } from "../../shared/repositories/base.repository.ts";
import { prisma } from "../../prisma/index.ts";
import { UserModel } from "../../generated/prisma/models.ts";

/**
 * Users Repository
 * 
 * Repository for user entities extending BaseRepository for type-safe CRUD operations.
 * Provides user-specific query methods while inheriting standard CRUD from the base class.
 * Uses instance-based approach for better dependency injection and testing.
 */
export class UsersRepository extends BaseRepository<
  UserModel,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserDelegate
> {
  
  /* ========================================
   * Repository Configuration
   * ======================================== */

  protected getDelegate(tx?: Prisma.TransactionClient): Prisma.UserDelegate {
    return tx?.user ?? prisma.user;
  }

  /* ========================================
   * Query Methods
   * ======================================== */

  /**
   * Find a user by identity provider information
   */
  async findByIdentityProvider(
    identityProvider: string,
    identityProviderId: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserModel | null> {
    return await this.getDelegate(tx).findFirst({
      where: {
        identityProvider,
        identityProviderId,
        deletedAt: null
      }
    });
  }

  /**
   * Find a user by email address
   * 
   * Searches for users by email regardless of identity provider.
   * Used for email conflict detection during authentication.
   * 
   * @param email - The email address to search for
   * @param tx - Optional transaction client for database operations
   * @returns Promise<UserModel | null> - The user if found, null otherwise
   */
  async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserModel | null> {
    return await this.getDelegate(tx).findFirst({
      where: {
        email,
        deletedAt: null
      }
    });
  }
}