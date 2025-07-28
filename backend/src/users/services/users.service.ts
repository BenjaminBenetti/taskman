import type { User } from "../models/user.model.ts";
import { UsersRepository } from "../repositories/users.repository.ts";
import { TenantsService } from "../../tenants/services/tenants.service.ts";
import { AssigneesRepository } from "../../assignees/repositories/assignees.repository.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../prisma/index.ts";

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
    return await this.usersRepository.findByIdentityProvider(identityProvider, identityProviderId);
  }

  /**
   * Update user with provided data
   */
  async updateUser(userId: string, updateData: Prisma.UserUpdateInput): Promise<User> {
    return await this.usersRepository.update(userId, updateData);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.usersRepository.getById(userId);
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
    // If no transaction provided, wrap in a new transaction
    if (!tx) {
      return await prisma.$transaction(async (transaction) => {
        return await this._createUserWithSelfAssignee(
          name,
          email,
          identityProvider,
          identityProviderId,
          tenantId,
          transaction
        );
      });
    }

    /* ========================================
     * Step 1: Create Assignee with Temporary Creator
     * ======================================== */
    
    // First create the assignee with a temporary creatorId
    const assigneeData: Prisma.AssigneeCreateInput = {
      name: name,
      email: email,
      isActive: true,
      tenant: { connect: { id: tenantId } },
      creator: { connect: { id: crypto.randomUUID() } } // Temporary UUID, will be updated after user creation
    };
    
    const assignee = await this.assigneesRepository.create(assigneeData, tx);

    /* ========================================
     * Step 2: Create User with Assignee Reference
     * ======================================== */
    
    // Create the user with proper assignee reference
    const userData: Prisma.UserCreateInput = {
      email: email,
      name: name,
      identityProvider,
      identityProviderId,
      tenant: { connect: { id: tenantId } },
      selfAssignee: { connect: { id: assignee.id } }
    };

    const user = await this.usersRepository.create(userData, tx);

    /* ========================================
     * Step 3: Update Assignee with Real User Reference
     * ======================================== */
    
    // Update the assignee's creatorId to point to the actual user
    const updateData: Prisma.AssigneeUpdateInput = {
      creator: { connect: { id: user.id } }
    };
    
    await this.assigneesRepository.update(assignee.id, updateData, tx);

    return user;
  }
}