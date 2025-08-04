import { z } from "zod";
import { VALIDATION_LIMITS } from "../../../shared/constants/validation-limits.ts";
import { MessageRole } from "../../../generated/prisma/enums.ts";

/* ========================================
 * Validation Schemas
 * ======================================== */

/**
 * ChatMessage ID Input Validation Schema
 *
 * Simple validation schema for operations that only require a chat message ID.
 * Ensures the ID is a valid UUID format for data integrity.
 */
export const chatMessageIdInput = z.object({
  chatMessageId: z.string().uuid("Invalid chat message ID format"),
});

/**
 * Create ChatMessage Input Validation Schema
 *
 * Comprehensive validation schema for creating new chat messages with business rules
 * and data integrity constraints. Uses shared validation limits to eliminate
 * magic numbers and maintain consistency.
 */
export const createChatMessageInput = z.object({
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
export const updateChatMessageInput = z.object({
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
export const getChatMessagesInput = z.object({
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