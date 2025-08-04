import type { ChatMessage } from "../models/chat-message.model.ts";
import { ChatMessagesRepository } from "../repositories/chat-messages.repository.ts";
import { chatMessageConverter } from "../converters/chat-message.converter.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../prisma/index.ts";
import { TRPCError } from "@trpc/server";
import { FieldValidators } from "../../shared/validation/field-validators.ts";
import { VALIDATION_LIMITS } from "../../shared/constants/validation-limits.ts";
import { MessageRole } from "../../generated/prisma/enums.ts";
import type { User } from "../../users/models/user.model.ts";

/* ========================================
 * Error Message Constants
 * ======================================== */

const ERROR_MESSAGES = {
  ASSIGNEE_NOT_FOUND: 'Assignee not found',
  ASSIGNEE_DIFFERENT_TENANT: 'Cannot access assignee from different tenant',
  TASK_NOT_FOUND: 'Task not found',
  TASK_DIFFERENT_TENANT: 'Cannot access task from different tenant',
  CHAT_MESSAGE_NOT_FOUND: 'Chat message not found',
  CHAT_MESSAGE_DIFFERENT_TENANT: 'Cannot access chat message from different tenant',
  INVALID_MESSAGE_ROLE: 'Invalid message role. Must be USER, ASSISTANT, or SYSTEM',
} as const;

/**
 * ChatMessages Service
 * 
 * Contains comprehensive business logic for chat message operations within the TaskMan system.
 * Handles chat message CRUD operations, validation, and business rule enforcement for AI conversations.
 * Enforces business rules and tenant isolation for secure multi-tenant chat message management.
 * 
 * Key responsibilities:
 * - Chat message creation with validation and business rules
 * - Chat message retrieval with filtering and tenant isolation
 * - Chat message updates with content and role validation
 * - Chat message deletion (soft delete) with proper cleanup
 * - Content length validation and trimming
 * - Role validation and business rule enforcement
 * - Assignee and task validation with tenant isolation
 */
export class ChatMessagesService {
  private chatMessagesRepository = new ChatMessagesRepository();

  /* ========================================
   * Private Validation Methods
   * ======================================== */

  /**
   * Validate that an assignee exists and belongs to the specified tenant
   * 
   * @param assigneeId - The assignee ID to validate
   * @param tenantId - The tenant ID to check against
   * @throws {TRPCError} When assignee not found or belongs to different tenant
   */
  private async validateAssigneeBelongsToTenant(assigneeId: string, tenantId: string): Promise<void> {
    const assignee = await prisma.assignee.findUnique({
      where: { id: assigneeId },
      select: { id: true, tenantId: true, isActive: true, deletedAt: true }
    });

    if (!assignee || assignee.deletedAt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: ERROR_MESSAGES.ASSIGNEE_NOT_FOUND,
      });
    }

    if (assignee.tenantId !== tenantId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: ERROR_MESSAGES.ASSIGNEE_DIFFERENT_TENANT,
      });
    }
  }

  /**
   * Validate that a task exists and belongs to the specified tenant
   * 
   * @param taskId - The task ID to validate
   * @param tenantId - The tenant ID to check against
   * @throws {TRPCError} When task not found or belongs to different tenant
   */
  private async validateTaskBelongsToTenant(taskId: string, tenantId: string): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, tenantId: true, deletedAt: true }
    });

    if (!task || task.deletedAt) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: ERROR_MESSAGES.TASK_NOT_FOUND,
      });
    }

    if (task.tenantId !== tenantId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: ERROR_MESSAGES.TASK_DIFFERENT_TENANT,
      });
    }
  }

  /**
   * Validate that a message role is valid
   * 
   * @param role - The message role to validate
   * @throws {TRPCError} When role is invalid
   */
  private validateMessageRole(role: MessageRole): void {
    if (!Object.values(MessageRole).includes(role)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: ERROR_MESSAGES.INVALID_MESSAGE_ROLE,
      });
    }
  }

  /* ========================================
   * Public Methods - CRUD Operations
   * ======================================== */

  /**
   * Create a new chat message with validation and business rules
   * 
   * Creates a new chat message with proper validation of content length,
   * role permissions, and relationship constraints. Enforces tenant isolation
   * and validates that assignee and optional task belong to the user's tenant.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param content - The message content (required, 1-10000 characters)
   * @param role - The message role (USER, ASSISTANT, SYSTEM)
   * @param assigneeId - The assignee ID (required, must belong to tenant)
   * @param taskId - Optional task ID (must belong to tenant if provided)
   * @returns Promise<ChatMessage> - The created chat message with all properties
   * @throws {TRPCError} When validation fails or business rules violated
   * 
   * @example
   * ```typescript
   * const newMessage = await chatMessagesService.createChatMessage(
   *   currentUser,
   *   'How can I help you with this task?',
   *   MessageRole.ASSISTANT,
   *   'assignee-123',
   *   'task-456'
   * );
   * ```
   */
  async createChatMessage(
    actor: User,
    content: string,
    role: MessageRole,
    assigneeId: string,
    taskId?: string | null
  ): Promise<ChatMessage> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Business Rules
       * ======================================== */
      
      // Validate content requirements
      const trimmedContent = content.trim();
      FieldValidators.validateRequired(trimmedContent, 'message content');
      FieldValidators.validateLength(trimmedContent, 'message content', VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH);

      // Validate role
      this.validateMessageRole(role);

      // Validate assignee exists and belongs to tenant
      await this.validateAssigneeBelongsToTenant(assigneeId, actor.tenantId);

      // Validate task if provided
      if (taskId) {
        await this.validateTaskBelongsToTenant(taskId, actor.tenantId);
      }

      /* ========================================
       * Create Chat Message Entity
       * ======================================== */
      
      const chatMessageData: Prisma.ChatMessageCreateInput = {
        id: crypto.randomUUID(),
        content: trimmedContent,
        role,
        tenant: { connect: { id: actor.tenantId } },
        assignee: { connect: { id: assigneeId } },
        ...(taskId && { task: { connect: { id: taskId } } }),
      };

      const chatMessageEntity = await this.chatMessagesRepository.create(chatMessageData, tx);
      
      return chatMessageConverter.toDomain(chatMessageEntity);
    });
  }

  /**
   * Get a chat message by ID with tenant isolation
   * 
   * Retrieves a specific chat message by ID ensuring it belongs to the actor's tenant.
   * Includes optional relationship data for complete information.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param chatMessageId - The chat message ID to retrieve
   * @param includeRelations - Whether to include task and assignee relations
   * @returns Promise<ChatMessage | null> - The chat message if found, null otherwise
   * 
   * @example
   * ```typescript
   * const message = await chatMessagesService.getChatMessageById(
   *   currentUser, 
   *   'msg-456',
   *   true
   * );
   * if (message) {
   *   console.log(`Message: ${message.content} from ${message.role}`);
   * }
   * ```
   */
  async getChatMessageById(
    actor: User, 
    chatMessageId: string,
    includeRelations: boolean = false
  ): Promise<ChatMessage | null> {
    const chatMessageEntity = await this.chatMessagesRepository.getByIdWithRelations(
      chatMessageId, 
      includeRelations
    );
    
    // Check if chat message exists and belongs to the actor's tenant
    if (!chatMessageEntity || chatMessageEntity.tenantId !== actor.tenantId) {
      return null;
    }
    
    return chatMessageConverter.toDomain(chatMessageEntity);
  }

  /**
   * Get chat messages by tenant with comprehensive filtering
   * 
   * Retrieves chat messages within the actor's tenant context with advanced filtering capabilities.
   * Supports filtering by role, task association, assignee, and content search with pagination.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param filters - Optional filtering criteria
   * @param includeRelations - Whether to include task and assignee relations
   * @returns Promise<ChatMessage[]> - Array of chat messages matching filter criteria
   * 
   * @example
   * ```typescript
   * const assistantMessages = await chatMessagesService.getChatMessagesByTenant(
   *   currentUser,
   *   { role: MessageRole.ASSISTANT, taskId: 'task-123', limit: 20 },
   *   true
   * );
   * ```
   */
  async getChatMessagesByTenant(
    actor: User,
    filters?: {
      role?: MessageRole;
      taskId?: string;
      assigneeId?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
    includeRelations: boolean = false
  ): Promise<ChatMessage[]> {
    // Validate search length if provided
    if (filters?.search) {
      FieldValidators.validateOptionalLength(
        filters.search, 
        'search term', 
        VALIDATION_LIMITS.CHAT_MESSAGE.SEARCH_MAX_LENGTH
      );
    }

    // Validate assignee belongs to tenant if filtering by assignee
    if (filters?.assigneeId) {
      try {
        await this.validateAssigneeBelongsToTenant(filters.assigneeId, actor.tenantId);
      } catch {
        // Return empty array if assignee doesn't exist or doesn't belong to tenant
        return [];
      }
    }

    // Validate task belongs to tenant if filtering by task
    if (filters?.taskId) {
      try {
        await this.validateTaskBelongsToTenant(filters.taskId, actor.tenantId);
      } catch {
        // Return empty array if task doesn't exist or doesn't belong to tenant
        return [];
      }
    }

    const chatMessageEntities = await this.chatMessagesRepository.findByTenantWithFilters(
      actor.tenantId,
      {
        ...filters,
        limit: filters?.limit || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
        offset: filters?.offset || 0,
      },
      includeRelations
    );
    
    return chatMessageConverter.toDomainArray(chatMessageEntities);
  }

  /**
   * Update a chat message with validation and business rules
   * 
   * Updates an existing chat message with proper validation of content length
   * and role permissions. Enforces business rules for data integrity and
   * maintains tenant isolation.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param chatMessageId - The chat message ID to update
   * @param updateData - Partial chat message data to update
   * @returns Promise<ChatMessage> - The updated chat message with all properties
   * @throws {TRPCError} When message not found, validation fails, or business rules violated
   * 
   * @example
   * ```typescript
   * const updatedMessage = await chatMessagesService.updateChatMessage(
   *   currentUser,
   *   'msg-456',
   *   { content: 'Updated message content' }
   * );
   * ```
   */
  async updateChatMessage(
    actor: User,
    chatMessageId: string,
    updateData: {
      content?: string;
      role?: MessageRole;
    }
  ): Promise<ChatMessage> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Chat Message Exists
       * ======================================== */
      
      const existingChatMessage = await this.chatMessagesRepository.getById(chatMessageId, tx);

      if (!existingChatMessage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ERROR_MESSAGES.CHAT_MESSAGE_NOT_FOUND,
        });
      }

      // Check tenant isolation
      if (existingChatMessage.tenantId !== actor.tenantId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: ERROR_MESSAGES.CHAT_MESSAGE_DIFFERENT_TENANT,
        });
      }

      /* ========================================
       * Validate Business Rules
       * ======================================== */

      // Validate content if being updated
      if (updateData.content !== undefined) {
        const trimmedContent = updateData.content.trim();
        FieldValidators.validateRequired(trimmedContent, 'message content');
        FieldValidators.validateLength(trimmedContent, 'message content', VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH);
        updateData.content = trimmedContent;
      }

      // Validate role if being updated
      if (updateData.role !== undefined) {
        this.validateMessageRole(updateData.role);
      }

      /* ========================================
       * Update Chat Message Entity
       * ======================================== */
      
      const prismaUpdateData: Prisma.ChatMessageUpdateInput = {
        ...(updateData.content !== undefined && { content: updateData.content }),
        ...(updateData.role !== undefined && { role: updateData.role }),
        updatedAt: new Date(),
      };

      const updatedChatMessageEntity = await this.chatMessagesRepository.update(
        chatMessageId, 
        prismaUpdateData, 
        tx
      );
      
      return chatMessageConverter.toDomain(updatedChatMessageEntity);
    });
  }

  /**
   * Delete a chat message (soft delete)
   * 
   * Performs a soft delete on the specified chat message by setting the deletedAt
   * timestamp. The message remains in the database for audit purposes but
   * is excluded from normal queries.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param chatMessageId - The chat message ID to delete
   * @throws {TRPCError} When message not found or already deleted
   * 
   * @example
   * ```typescript
   * await chatMessagesService.deleteChatMessage(currentUser, 'msg-456');
   * ```
   */
  async deleteChatMessage(actor: User, chatMessageId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      const existingChatMessage = await this.chatMessagesRepository.getById(chatMessageId, tx);

      if (!existingChatMessage) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: ERROR_MESSAGES.CHAT_MESSAGE_NOT_FOUND,
        });
      }

      // Check tenant isolation
      if (existingChatMessage.tenantId !== actor.tenantId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: ERROR_MESSAGES.CHAT_MESSAGE_DIFFERENT_TENANT,
        });
      }

      await this.chatMessagesRepository.delete(chatMessageId, tx);
    });
  }
}