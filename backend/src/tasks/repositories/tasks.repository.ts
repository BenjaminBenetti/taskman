import { type Prisma } from "../../generated/prisma/client.ts";
import { BaseRepository } from "../../shared/repositories/base.repository.ts";
import { prisma } from "../../prisma/index.ts";
import { TaskModel } from "../../generated/prisma/models.ts";
import type { TaskFilters } from "../models/task.model.ts";

/**
 * Tasks Repository
 * 
 * Repository for task entities extending BaseRepository for type-safe CRUD operations.
 * Provides task-specific query methods while inheriting standard CRUD from the base class.
 * Handles tenant isolation, soft deletes, and complex filtering for task management.
 */
export class TasksRepository extends BaseRepository<
  TaskModel,
  Prisma.TaskCreateInput,
  Prisma.TaskUpdateInput,
  Prisma.TaskDelegate
> {
  
  /* ========================================
   * Repository Configuration
   * ======================================== */

  protected getDelegate(tx?: Prisma.TransactionClient): Prisma.TaskDelegate {
    return tx?.task ?? prisma.task;
  }

  /* ========================================
   * Query Methods
   * ======================================== */

  /**
   * Find tasks by tenant with comprehensive filtering support
   * 
   * Provides advanced task filtering capabilities including status, priority,
   * assignee, creator, due date, and text search. Supports pagination and
   * relationship data inclusion for complete task information.
   * 
   * @param tenantId - The tenant ID for data isolation
   * @param filters - Optional filtering criteria
   * @param includeRelations - Whether to include creator/assignee/message count data
   * @param tx - Optional transaction client for database operations
   * @returns Promise<TaskModel[]> - Array of tasks matching filter criteria
   * 
   * @example
   * ```typescript
   * const tasks = await tasksRepository.findByTenantWithFilters(
   *   'tenant-123',
   *   { status: TaskStatus.PENDING, priority: Priority.HIGH, limit: 10 },
   *   true
   * );
   * ```
   */
  async findByTenantWithFilters(
    tenantId: string,
    filters?: TaskFilters,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<TaskModel[]> {
    // Build where clause with tenant isolation and soft delete filtering
    const where: Prisma.TaskWhereInput = {
      tenantId,
      deletedAt: null,
    };

    // Apply optional filters
    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    if (filters?.creatorId) {
      where.creatorId = filters.creatorId;
    }

    if (filters?.dueBefore) {
      where.remindAt = {
        lte: filters.dueBefore,
      };
    }

    if (filters?.search) {
      where.OR = [
        {
          title: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build include clause for relationships
    const include: Prisma.TaskInclude | undefined = includeRelations ? {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          chatMessages: true,
        },
      },
    } : undefined;

    return await this.getDelegate(tx).findMany({
      where,
      include,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  /**
   * Find tasks assigned to a specific assignee
   * 
   * Retrieves all active tasks assigned to a particular assignee within
   * the tenant context. Useful for assignee-specific task views and
   * workload management.
   * 
   * @param tenantId - The tenant ID for data isolation
   * @param assigneeId - The assignee ID to filter tasks
   * @param includeRelations - Whether to include creator/assignee/message count data
   * @param tx - Optional transaction client for database operations
   * @returns Promise<TaskModel[]> - Array of tasks assigned to the assignee
   * 
   * @example
   * ```typescript
   * const assigneeTasks = await tasksRepository.findByAssignee(
   *   'tenant-123',
   *   'assignee-456',
   *   true
   * );
   * ```
   */
  async findByAssignee(
    tenantId: string,
    assigneeId: string,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<TaskModel[]> {
    const include: Prisma.TaskInclude | undefined = includeRelations ? {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          chatMessages: true,
        },
      },
    } : undefined;

    return await this.getDelegate(tx).findMany({
      where: {
        tenantId,
        assigneeId,
        deletedAt: null,
      },
      include,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }


  /* ========================================
   * Extended CRUD Operations
   * ======================================== */

  /**
   * Find a task by ID within tenant context
   * 
   * Overrides the base getById method to enforce tenant isolation.
   * Ensures tasks can only be accessed within their own tenant.
   * 
   * @param tenantId - The tenant ID for data isolation
   * @param taskId - The task ID to retrieve
   * @param includeRelations - Whether to include creator/assignee/message count data
   * @param tx - Optional transaction client for database operations
   * @returns Promise<TaskModel | null> - The task if found, null otherwise
   */
  async getByIdWithTenant(
    tenantId: string,
    taskId: string,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<TaskModel | null> {
    const include: Prisma.TaskInclude | undefined = includeRelations ? {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          chatMessages: true,
        },
      },
    } : undefined;

    return await this.getDelegate(tx).findFirst({
      where: {
        id: taskId,
        tenantId,
        deletedAt: null,
      },
      include,
    });
  }
}