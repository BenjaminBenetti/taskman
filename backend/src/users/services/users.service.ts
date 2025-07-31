import type { User } from "../models/user.model.ts";
import { UsersRepository } from "../repositories/users.repository.ts";
import { TenantsService } from "../../tenants/services/tenants.service.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../prisma/index.ts";
import { userConverter } from "../converters/user.converter.ts";
import { AssigneesRepository } from "../../assignees/repositories/assignees.repository.ts";

/**
 * Users Service
 * 
 * Contains business logic for pure user operations.
 * Handles user CRUD operations without auth concerns.
 */
export class UsersService {
  private usersRepository = new UsersRepository();
  private tenantsService = new TenantsService();
  private assigneesRepository = new AssigneesRepository();

  /* ========================================
   * Public Methods
   * ======================================== */

  /**
   * Find or create a user based on identity provider payload
   * 
   * If user exists, update with latest info from identity provider.
   * If user doesn't exist, this method only finds - creation requires explicit tenant/assignee setup.
   */
  async findByIdentityProvider(
    identityProvider: string,
    identityProviderId: string
  ): Promise<User | null> {
    const userEntity = await this.usersRepository.findByIdentityProvider(identityProvider, identityProviderId);
    return userEntity ? userConverter.toDomain(userEntity) : null;
  }

  /**
   * Update user with provided data
   */
  async updateUser(userId: string, updateData: Prisma.UserUpdateInput): Promise<User> {
    const userEntity = await this.usersRepository.update(userId, updateData);
    return userConverter.toDomain(userEntity);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const userEntity = await this.usersRepository.getById(userId);
    return userEntity ? userConverter.toDomain(userEntity) : null;
  }

  /**
   * Create a new user with tenant and self-assignee
   * 
   * This method handles the complete user creation orchestration:
   * - Creates a tenant for the user
   * - Creates the user with proper relationships
   * - Creates a self-assignee that represents the user
   * - Handles the circular dependency between user and assignee
   * 
   * All operations are performed within a single transaction to ensure atomicity.
   * 
   * @param name - User's display name
   * @param email - User's email address
   * @param identityProvider - Identity provider name (e.g., "google")
   * @param identityProviderId - Identity provider's unique user ID
   * @returns Promise<User> - The created user with all relationships
   */
  async createUser(
    name: string,
    email: string,
    identityProvider: string,
    identityProviderId: string
  ): Promise<User> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Create Tenant within Transaction
       * ======================================== */
      
      const tenant = await this.tenantsService.createTenantForUser(email, tx);

      /* ========================================
       * Create User and Self-Assignee with Circular Dependency
       * ======================================== */
      
      return await this._createUserWithSelfAssignee(
        name,
        email,
        identityProvider,
        identityProviderId,
        tenant.id,
        tx
      );
    });
  }

  /* ========================================
   * Private Methods
   * ======================================== */

  /**
   * Create a user with their self-assignee in a transaction
   * Handles the circular dependency between user and assignee
   */
  private async _createUserWithSelfAssignee(
    name: string,
    email: string,
    identityProvider: string,
    identityProviderId: string,
    tenantId: string,
    tx?: Prisma.TransactionClient
  ): Promise<User> {
    /* ========================================
     * Create User with Nested Self-Assignee Creation
     * ======================================== */
    
    // Generate UUIDs for both entities to handle circular dependency
    const userId = crypto.randomUUID();
    const assigneeId = crypto.randomUUID();
    
    // Create user with nested self-assignee
    const userData: Prisma.UserCreateInput = {
      id: userId,
      email: email,
      name: name,
      identityProvider,
      identityProviderId,
      tenant: { connect: { id: tenantId } },
      selfAssignee: {
        create: {
          id: assigneeId,
          name: name,
          email: email,
          isActive: true,
          tenant: { connect: { id: tenantId } },
        }
      }
    };

    const userEntity = await this.usersRepository.create(userData, tx);

    /* ========================================
     * Create Self-Assignee with Circular Reference
     * ======================================== */
    const assigneeData: Prisma.AssigneeUpdateInput = {
      creator: { connect: { id: userEntity.id } },
    };

    await this.assigneesRepository.update(userEntity.assigneeId, assigneeData, tx);

    return userConverter.toDomain(userEntity);
  }
}