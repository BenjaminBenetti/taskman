import type { Tenant } from "../models/tenant.model.ts";
import { TenantsRepository } from "../repositories/tenants.repository.ts";
import { type Prisma } from "../../generated/prisma/client.ts";

/**
 * Tenants Service
 * 
 * Contains business logic for tenant operations.
 * Handles tenant creation and retrieval.
 */
export class TenantsService {
  private tenantsRepository = new TenantsRepository();

  /* ========================================
   * Public Methods
   * ======================================== */

  /**
   * Create a new tenant for a user
   * Generates a default tenant name based on user's email
   */
  async createTenantForUser(userEmail: string, tx?: Prisma.TransactionClient): Promise<Tenant> {
    const tenantName = this._generateTenantName(userEmail);
    
    const tenantData: Prisma.TenantCreateInput = {
      name: tenantName,
      description: `Personal workspace for ${userEmail}`
    };

    return await this.tenantsRepository.create(tenantData, tx);
  }

  /* ========================================
   * Private Methods
   * ======================================== */

  /**
   * Generate a tenant name from user email
   * Takes the part before @ and capitalizes it
   */
  private _generateTenantName(email: string): string {
    const username = email.split("@")[0];
    return `${username}'s Workspace`;
  }
}