import type { Assignee } from "../models/assignee.model.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { BaseRepository } from "../../shared/repositories/base.repository.ts";
import { prisma } from "../../prisma/index.ts";

/**
 * Assignees Repository
 * 
 * Repository for assignee entities extending BaseRepository for type-safe CRUD operations.
 * Provides assignee-specific query methods while inheriting standard CRUD from the base class.
 * Uses instance-based approach for better dependency injection and testing.
 */
export class AssigneesRepository extends BaseRepository<
  Assignee,
  Prisma.AssigneeCreateInput,
  Prisma.AssigneeUpdateInput,
  Prisma.AssigneeDelegate
> {
  
  /* ========================================
   * Repository Configuration
   * ======================================== */

  protected getDelegate(tx?: Prisma.TransactionClient): Prisma.AssigneeDelegate {
    return tx?.assignee ?? prisma.assignee;
  }

  /* ========================================
   * Query Methods
   * ======================================== */

  /**
   * Find the first assignee created by a specific user
   */
  async findByCreatorId(creatorId: string, tx?: Prisma.TransactionClient): Promise<Assignee | null> {
    return await this.getDelegate(tx).findFirst({
      where: {
        creatorId,
        deletedAt: null
      }
    });
  }
}