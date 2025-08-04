import { z } from "zod";
import { router } from "../../index.ts";
import { protectedProcedure } from "../../middleware/protectedProcedure.ts";
import { ChatMessagesService } from "../../../chatMessages/services/chat-messages.service.ts";
import { VALIDATION_LIMITS } from "../../../shared/constants/validation-limits.ts";
import { MessageRole } from "../../../generated/prisma/enums.ts";

/* ========================================
 * Validation Schemas
 * ======================================== */

/**
 * ChatMessage Filters Interface
 *
 * Defines the structure for filtering chat messages in search operations.
 * Used by the service layer for type-safe filtering operations.
 */
export interface ChatMessageFilters {
  /**
   * Filter by message role
   * - USER: Messages from users
   * - ASSISTANT: Messages from AI assistant
   * - SYSTEM: System-generated messages
   */
  role?: MessageRole;

  /**
   * Filter by task ID
   * Only messages associated with the specified task
   */
  taskId?: string;

  /**
   * Filter by assignee ID
   * Only messages associated with the specified assignee
   */
  assigneeId?: string;

  /**
   * Text search within message content
   * Case-insensitive search
   */
  search?: string;

  /**
   * Maximum number of results to return
   * Must be between 1 and 100
   */
  limit?: number;

  /**
   * Number of results to skip for pagination
   * Must be 0 or greater
   */
  offset?: number;
}

/**
 * ChatMessage ID Input Validation Schema
 *
 * Simple validation schema for operations that only require a chat message ID.
 * Ensures the ID is a valid UUID format for data integrity.
 */
const chatMessageIdInput = z.object({
  chatMessageId: z.string().uuid("Invalid chat message ID format"),
});

/**
 * Create ChatMessage Input Validation Schema
 *
 * Comprehensive validation schema for creating new chat messages with business rules
 * and data integrity constraints. Uses shared validation limits to eliminate
 * magic numbers and maintain consistency.
 */
const createChatMessageInput = z.object({
  content: z.string()
    .min(VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MIN_LENGTH, "Message content is required")
    .max(VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH, `Message content must be ${VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH} characters or less`)
    .trim(),

  role: z.nativeEnum(MessageRole, {
    message: "Role must be USER, ASSISTANT, or SYSTEM"
  }),

  assigneeId: z.string().uuid("Invalid assignee ID format"),

  taskId: z.string()
    .uuid("Invalid task ID format")
    .optional()
    .transform(val => val || null),
});

/**
 * Update ChatMessage Input Validation Schema
 *
 * Flexible validation schema for partial chat message updates with optional fields
 * and business rule enforcement. Uses shared validation limits for consistency.
 */
const updateChatMessageInput = z.object({
  chatMessageId: z.string().uuid("Invalid chat message ID format"),

  content: z.string()
    .min(VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MIN_LENGTH, "Message content cannot be empty")
    .max(VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH, `Message content must be ${VALIDATION_LIMITS.CHAT_MESSAGE.CONTENT_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),

  role: z.nativeEnum(MessageRole, {
    message: "Role must be USER, ASSISTANT, or SYSTEM"
  }).optional(),
});

/**
 * Get ChatMessages Input Validation Schema
 *
 * Comprehensive filtering options with pagination support for efficient
 * chat message retrieval and search operations. Uses shared validation limits
 * for consistent pagination and search constraints.
 */
const getChatMessagesInput = z.object({
  role: z.nativeEnum(MessageRole, {
    message: "Role must be USER, ASSISTANT, or SYSTEM"
  }).optional(),

  taskId: z.string().uuid("Invalid task ID format").optional(),

  assigneeId: z.string().uuid("Invalid assignee ID format").optional(),

  search: z.string()
    .max(VALIDATION_LIMITS.CHAT_MESSAGE.SEARCH_MAX_LENGTH, `Search term must be ${VALIDATION_LIMITS.CHAT_MESSAGE.SEARCH_MAX_LENGTH} characters or less`)
    .trim()
    .optional(),

  limit: z.number()
    .int("Limit must be a whole number")
    .min(VALIDATION_LIMITS.PAGINATION.MIN_LIMIT, `Limit must be at least ${VALIDATION_LIMITS.PAGINATION.MIN_LIMIT}`)
    .max(VALIDATION_LIMITS.PAGINATION.MAX_LIMIT, `Limit cannot exceed ${VALIDATION_LIMITS.PAGINATION.MAX_LIMIT}`)
    .default(VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT),

  offset: z.number()
    .int("Offset must be a whole number")
    .min(VALIDATION_LIMITS.PAGINATION.MIN_OFFSET, "Offset cannot be negative")
    .default(VALIDATION_LIMITS.PAGINATION.MIN_OFFSET),

  includeRelations: z.boolean()
    .default(false)
    .describe("Whether to include task and assignee relationship data"),
});

/* ========================================
 * Type Exports
 * ======================================== */

export type ChatMessageIdInput = z.infer<typeof chatMessageIdInput>;
export type CreateChatMessageInput = z.infer<typeof createChatMessageInput>;
export type UpdateChatMessageInput = z.infer<typeof updateChatMessageInput>;
export type GetChatMessagesInput = z.infer<typeof getChatMessagesInput>;

/* ========================================
 * Service Instance
 * ======================================== */

// Create single service instance for efficiency and consistency
const chatMessagesService = new ChatMessagesService();

/* ========================================
 * ChatMessage Router Implementation
 * ======================================== */

/**
 * ChatMessage router providing comprehensive chat message management operations
 * 
 * Implements full CRUD operations with advanced filtering, validation,
 * and business logic enforcement. All endpoints are protected and
 * require authentication.
 * 
 * Features:
 * - Chat message creation with comprehensive validation
 * - Chat message retrieval with filtering and pagination
 * - Chat message updates with business rule enforcement
 * - Chat message deletion (soft delete)
 * - Role-based filtering and content search
 * - Task and assignee association filtering
 * - Tenant isolation and security
 */
export const chatMessageRouter = router({
  /**
   * Create a new chat message
   * 
   * Creates a new chat message with validation and business rules enforcement.
   * Validates content length, role permissions, and relationship constraints.
   * Enforces tenant isolation for secure multi-tenant operation.
   * 
   * @input CreateChatMessageInput - Chat message creation data with validation
   * @returns ChatMessage - The created chat message with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  create: protectedProcedure
    .input(createChatMessageInput)
    .mutation(async ({ input, ctx }) => {
      return await chatMessagesService.createChatMessage(
        ctx.user,
        input.content,
        input.role,
        input.assigneeId,
        input.taskId
      );
    }),

  /**
   * Get a chat message by ID
   * 
   * Retrieves a specific chat message by ID with tenant isolation.
   * Includes optional relationship data for complete information display.
   * 
   * @input ChatMessageIdInput - Chat message ID with validation
   * @returns ChatMessage | null - The chat message if found, null otherwise
   * @throws TRPCError - When chat message ID is invalid
   */
  get: protectedProcedure
    .input(chatMessageIdInput.extend({
      includeRelations: z.boolean()
        .default(false)
        .describe("Whether to include task and assignee relationship data"),
    }))
    .query(async ({ input, ctx }) => {
      return await chatMessagesService.getChatMessageById(
        ctx.user, 
        input.chatMessageId,
        input.includeRelations
      );
    }),

  /**
   * Get chat messages with filtering and pagination
   * 
   * Retrieves chat messages within the user's tenant with comprehensive
   * filtering capabilities. Supports role, task, assignee, and content 
   * search filtering with pagination and optional relationship includes.
   * 
   * @input GetChatMessagesInput - Filter criteria and pagination options
   * @returns ChatMessage[] - Array of chat messages matching filter criteria
   * @throws TRPCError - When filter parameters are invalid
   */
  search: protectedProcedure
    .input(getChatMessagesInput)
    .query(async ({ input, ctx }) => {
      const { includeRelations, ...filters } = input;
      
      return await chatMessagesService.getChatMessagesByTenant(
        ctx.user, 
        filters,
        includeRelations
      );
    }),

  /**
   * Update a chat message
   * 
   * Updates an existing chat message with validation and business rules.
   * Supports partial updates and enforces content length validation
   * and role permission constraints.
   * 
   * @input UpdateChatMessageInput - Partial chat message data with validation
   * @returns ChatMessage - The updated chat message with all properties
   * @throws TRPCError - When validation fails or business rules violated
   */
  update: protectedProcedure
    .input(updateChatMessageInput)
    .mutation(async ({ input, ctx }) => {
      const { chatMessageId, ...updateData } = input;
      
      return await chatMessagesService.updateChatMessage(
        ctx.user,
        chatMessageId,
        updateData
      );
    }),

  /**
   * Delete a chat message (soft delete)
   * 
   * Performs a soft delete on the specified chat message within the user's tenant.
   * The message is marked as deleted but remains in the database for
   * audit purposes and potential recovery.
   * 
   * @input ChatMessageIdInput - Chat message ID with validation
   * @returns void
   * @throws TRPCError - When message not found or already deleted
   */
  delete: protectedProcedure
    .input(chatMessageIdInput)
    .mutation(async ({ input, ctx }) => {
      await chatMessagesService.deleteChatMessage(ctx.user, input.chatMessageId);
    }),

});