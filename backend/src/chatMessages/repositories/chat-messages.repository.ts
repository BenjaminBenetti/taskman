import { type Prisma } from "../../generated/prisma/client.ts";
import { BaseRepository } from "../../shared/repositories/base.repository.ts";
import { prisma } from "../../prisma/index.ts";
import { ChatMessageModel } from "../../generated/prisma/models.ts";
import { MessageRole } from "../../generated/prisma/enums.ts";

/**
 * ChatMessages Repository
 * 
 * Repository for chat message entities extending BaseRepository for type-safe CRUD operations.
 * Provides chat message-specific query methods while inheriting standard CRUD from the base class.
 * Uses instance-based approach for better dependency injection and testing.
 * 
 * Key features:
 * - Comprehensive filtering by role, task, assignee, and tenant
 * - Content search capabilities with case-insensitive matching
 * - Support for optional relationship includes (task, assignee)
 * - Efficient pagination and ordering by creation date
 */
export class ChatMessagesRepository extends BaseRepository<
  ChatMessageModel,
  Prisma.ChatMessageCreateInput,
  Prisma.ChatMessageUpdateInput,
  Prisma.ChatMessageDelegate
> {
  
  /* ========================================
   * Repository Configuration
   * ======================================== */

  protected getDelegate(tx?: Prisma.TransactionClient): Prisma.ChatMessageDelegate {
    return tx?.chatMessage ?? prisma.chatMessage;
  }

  /**
   * Get include object for optional relationship data
   * 
   * @param includeRelations - Whether to include task and assignee relations
   * @returns Prisma include object or undefined
   */
  private getIncludeRelations(includeRelations: boolean) {
    return includeRelations ? {
      task: true,
      assignee: true,
    } : undefined;
  }

  /* ========================================
   * Filtering and Search Methods
   * ======================================== */

  /**
   * Find chat messages by tenant with comprehensive filtering
   * 
   * Provides advanced filtering capabilities for chat messages within a specific tenant.
   * Supports filtering by role, task association, assignee, and content search with
   * pagination and ordering options.
   * 
   * @param tenantId - The tenant ID to filter by
   * @param filters - Optional filtering criteria
   * @param includeRelations - Whether to include task and assignee relations
   * @param tx - Optional transaction client
   * @returns Promise<ChatMessageModel[]> - Array of chat messages matching criteria
   * 
   * @example
   * ```typescript
   * const userMessages = await repository.findByTenantWithFilters(
   *   'tenant-123',
   *   { role: MessageRole.USER, search: 'help', limit: 10 },
   *   true
   * );
   * ```
   */
  async findByTenantWithFilters(
    tenantId: string,
    filters?: {
      role?: MessageRole;
      taskId?: string;
      assigneeId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<ChatMessageModel[]> {
    const whereClause: Prisma.ChatMessageWhereInput = {
      tenantId,
      deletedAt: null,
    };

    // Apply role filter
    if (filters?.role) {
      whereClause.role = filters.role;
    }

    // Apply task filter
    if (filters?.taskId) {
      whereClause.taskId = filters.taskId;
    }

    // Apply assignee filter
    if (filters?.assigneeId) {
      whereClause.assigneeId = filters.assigneeId;
    }

    // Apply content search
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        whereClause.content = { 
          contains: searchTerm, 
          mode: 'insensitive' 
        };
      }
    }

    return await this.getDelegate(tx).findMany({
      where: whereClause,
      include: this.getIncludeRelations(includeRelations),
      orderBy: {
        createdAt: 'desc', // Latest messages first
      },
      take: filters?.limit,
      skip: filters?.offset,
    });
  }

  /**
   * Find chat messages by specific task
   * 
   * Retrieves all chat messages associated with a specific task, ordered by creation date.
   * Useful for displaying task-specific conversation history.
   * 
   * @param taskId - The task ID to filter by
   * @param includeRelations - Whether to include task and assignee relations
   * @param tx - Optional transaction client
   * @returns Promise<ChatMessageModel[]> - Array of chat messages for the task
   * 
   * @example
   * ```typescript
   * const taskMessages = await repository.findByTaskId('task-456', true);
   * ```
   */
  async findByTaskId(
    taskId: string,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<ChatMessageModel[]> {
    return await this.getDelegate(tx).findMany({
      where: {
        taskId,
        deletedAt: null,
      },
      include: this.getIncludeRelations(includeRelations),
      orderBy: {
        createdAt: 'asc', // Chronological order for task conversations
      },
    });
  }

  /**
   * Find chat messages by specific assignee
   * 
   * Retrieves all chat messages associated with a specific assignee, ordered by creation date.
   * Useful for displaying assignee-specific conversation history across all tasks.
   * 
   * @param assigneeId - The assignee ID to filter by
   * @param includeRelations - Whether to include task and assignee relations
   * @param tx - Optional transaction client
   * @returns Promise<ChatMessageModel[]> - Array of chat messages for the assignee
   * 
   * @example
   * ```typescript
   * const assigneeMessages = await repository.findByAssigneeId('assignee-789', true);
   * ```
   */
  async findByAssigneeId(
    assigneeId: string,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<ChatMessageModel[]> {
    return await this.getDelegate(tx).findMany({
      where: {
        assigneeId,
        deletedAt: null,
      },
      include: this.getIncludeRelations(includeRelations),
      orderBy: {
        createdAt: 'desc', // Latest messages first
      },
    });
  }

  /**
   * Find chat messages with relation includes
   * 
   * Override of base getById method to support optional relationship includes.
   * Useful when you need the full chat message context with task and assignee data.
   * 
   * @param id - The chat message ID to retrieve
   * @param includeRelations - Whether to include task and assignee relations
   * @param tx - Optional transaction client
   * @returns Promise<ChatMessageModel | null> - The chat message with relations if found
   */
  async getByIdWithRelations(
    id: string,
    includeRelations: boolean = false,
    tx?: Prisma.TransactionClient
  ): Promise<ChatMessageModel | null> {
    return await this.getDelegate(tx).findUnique({
      where: { id },
      include: this.getIncludeRelations(includeRelations),
    });
  }
}