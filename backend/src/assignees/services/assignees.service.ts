import type { Assignee } from "../models/assignee.model.ts";
import { AssigneesRepository } from "../repositories/assignees.repository.ts";
import { assigneeConverter } from "../converters/assignee.converter.ts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { prisma } from "../../prisma/index.ts";
import { TRPCError } from "@trpc/server";
import { FieldValidators } from "../../shared/validation/field-validators.ts";
import { VALIDATION_LIMITS } from "../../shared/constants/validation-limits.ts";
import { type AssigneeFilters } from "../validation/assignee-filters.interface.ts";
import type { User } from "../../users/models/user.model.ts";

/**
 * Assignees Service
 * 
 * Contains comprehensive business logic for assignee operations within the TaskMan system.
 * Handles assignee CRUD operations, validation, and business rule enforcement.
 * Enforces business rules and tenant isolation for secure multi-tenant assignee management.
 * 
 * Key responsibilities:
 * - Assignee creation with validation and business rules
 * - Assignee retrieval with filtering and tenant isolation
 * - Assignee updates with data validation
 * - Assignee deletion (soft delete) with proper cleanup
 * - Email format validation and uniqueness enforcement
 * - Phone number validation and formatting
 * - Notes management with length constraints
 */
export class AssigneesService {
  private assigneesRepository = new AssigneesRepository();

  /* ========================================
   * Public Methods - CRUD Operations
   * ======================================== */

  /**
   * Create a new assignee with validation and business rules
   * 
   * Creates a new assignee with proper validation of email format,
   * phone number constraints, and notes length limits. Enforces tenant isolation
   * and validates that required fields are provided.
   * 
   * @param actor - The user performing the action (provides tenant context and creator ID)
   * @param name - The assignee name (required)
   * @param email - Optional email address (must be valid format)
   * @param phone - Optional phone number (max 50 characters)
   * @param notes - Optional notes (max 1000 characters)
   * @param isActive - Whether the assignee is active (defaults to true)
   * @returns Promise<Assignee> - The created assignee with all properties
   * @throws {TRPCError} When validation fails or business rules violated
   * 
   * @example
   * ```typescript
   * const newAssignee = await assigneesService.createAssignee(
   *   currentUser,
   *   'John Doe',
   *   'john.doe@example.com',
   *   '+1-555-0123',
   *   'Senior developer with React expertise',
   *   true
   * );
   * ```
   */
  async createAssignee(
    actor: User,
    name: string,
    email?: string | null,
    phone?: string | null,
    notes?: string | null,
    isActive: boolean = true
  ): Promise<Assignee> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Business Rules
       * ======================================== */
      
      // Validate name is not empty after trimming
      const trimmedName = name.trim();
      FieldValidators.validateRequired(trimmedName, 'assignee name');

      // Validate email format if provided
      FieldValidators.validateOptionalEmail(email);

      // Validate phone number length if provided
      FieldValidators.validateOptionalLength(phone, 'phone number', VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH);

      // Validate notes length if provided
      FieldValidators.validateOptionalLength(notes, 'notes', VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH);

      /* ========================================
       * Create Assignee Entity
       * ======================================== */
      
      const assigneeData: Prisma.AssigneeCreateInput = {
        id: crypto.randomUUID(),
        name: trimmedName,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        isActive,
        tenant: { connect: { id: actor.tenantId } },
        creator: { connect: { id: actor.id } },
      };

      const assigneeEntity = await this.assigneesRepository.create(assigneeData, tx);
      
      return assigneeConverter.toDomain(assigneeEntity);
    });
  }

  /**
   * Get an assignee by ID with tenant isolation
   * 
   * Retrieves a specific assignee by ID ensuring it belongs to the actor's tenant.
   * Includes all assignee properties for complete information.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param assigneeId - The assignee ID to retrieve
   * @returns Promise<Assignee | null> - The assignee if found, null otherwise
   * 
   * @example
   * ```typescript
   * const assignee = await assigneesService.getAssigneeById(currentUser, 'assignee-456');
   * if (assignee) {
   *   console.log(`Assignee: ${assignee.name} (${assignee.isActive ? 'Active' : 'Inactive'})`);
   * }
   * ```
   */
  async getAssigneeById(actor: User, assigneeId: string): Promise<Assignee | null> {
    const assigneeEntity = await this.assigneesRepository.getById(assigneeId);
    
    // Check if assignee exists and belongs to the actor's tenant
    if (!assigneeEntity || assigneeEntity.tenantId !== actor.tenantId) {
      return null;
    }
    
    return assigneeConverter.toDomain(assigneeEntity);
  }

  /**
   * Get assignees by tenant with comprehensive filtering
   * 
   * Retrieves assignees within the actor's tenant context with advanced filtering capabilities.
   * Supports filtering by active status, creator, and text search across name,
   * email, and notes fields with pagination.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param filters - Optional filtering criteria
   * @returns Promise<Assignee[]> - Array of assignees matching filter criteria
   * 
   * @example
   * ```typescript
   * const activeAssignees = await assigneesService.getAssigneesByTenant(
   *   currentUser,
   *   { isActive: true, search: 'john', limit: 20 }
   * );
   * ```
   */
  async getAssigneesByTenant(
    actor: User,
    filters?: AssigneeFilters
  ): Promise<Assignee[]> {
    const whereClause: Prisma.AssigneeWhereInput = {
      tenantId: actor.tenantId,
      deletedAt: null,
    };

    // Apply filters
    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters?.creatorId) {
      whereClause.creatorId = filters.creatorId;
    }

    // Search across name, email, and notes
    if (filters?.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        whereClause.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { notes: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }
    }

    const assigneeEntities = await prisma.assignee.findMany({
      where: whereClause,
      orderBy: [
        { isActive: 'desc' }, // Active assignees first
        { name: 'asc' },      // Then alphabetical by name
      ],
      take: filters?.limit || VALIDATION_LIMITS.PAGINATION.DEFAULT_LIMIT,
      skip: filters?.offset || 0,
    });
    
    return assigneeConverter.toDomainArray(assigneeEntities);
  }

  /**
   * Update an assignee with validation and business rules
   * 
   * Updates an existing assignee with proper validation of email format,
   * phone number constraints, and notes length limits. Enforces business
   * rules for data integrity and maintains tenant isolation.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param assigneeId - The assignee ID to update
   * @param updateData - Partial assignee data to update
   * @returns Promise<Assignee> - The updated assignee with all properties
   * @throws {TRPCError} When assignee not found, validation fails, or business rules violated
   * 
   * @example
   * ```typescript
   * const updatedAssignee = await assigneesService.updateAssignee(
   *   currentUser,
   *   'assignee-456',
   *   { email: 'newemail@example.com', isActive: false }
   * );
   * ```
   */
  async updateAssignee(
    actor: User,
    assigneeId: string,
    updateData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      notes?: string | null;
      isActive?: boolean;
    }
  ): Promise<Assignee> {
    return await prisma.$transaction(async (tx) => {
      /* ========================================
       * Validate Assignee Exists
       * ======================================== */
      
      const existingAssignee = await this.assigneesRepository.getById(assigneeId, tx);

      if (!existingAssignee) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Assignee with ID ${assigneeId} not found`,
        });
      }

      // Check tenant isolation
      if (existingAssignee.tenantId !== actor.tenantId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot update assignee from different tenant',
        });
      }

      /* ========================================
       * Validate Business Rules
       * ======================================== */

      // Validate name if being updated
      if (updateData.name !== undefined) {
        FieldValidators.validateRequired(updateData.name, 'assignee name');
      }

      // Validate email format if being updated
      if (updateData.email !== undefined) {
        FieldValidators.validateOptionalEmail(updateData.email);
      }

      // Validate phone number length if being updated
      if (updateData.phone !== undefined) {
        FieldValidators.validateOptionalLength(updateData.phone, 'phone number', VALIDATION_LIMITS.ASSIGNEE.PHONE_MAX_LENGTH);
      }

      // Validate notes length if being updated
      if (updateData.notes !== undefined) {
        FieldValidators.validateOptionalLength(updateData.notes, 'notes', VALIDATION_LIMITS.ASSIGNEE.NOTES_MAX_LENGTH);
      }

      /* ========================================
       * Update Assignee Entity
       * ======================================== */
      
      const prismaUpdateData: Prisma.AssigneeUpdateInput = {
        ...(updateData.name !== undefined && { name: updateData.name.trim() }),
        ...(updateData.email !== undefined && { 
          email: updateData.email?.trim() || null 
        }),
        ...(updateData.phone !== undefined && { 
          phone: updateData.phone?.trim() || null 
        }),
        ...(updateData.notes !== undefined && { 
          notes: updateData.notes?.trim() || null 
        }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        updatedAt: new Date(),
      };

      const updatedAssigneeEntity = await this.assigneesRepository.update(assigneeId, prismaUpdateData, tx);
      
      return assigneeConverter.toDomain(updatedAssigneeEntity);
    });
  }

  /**
   * Delete an assignee (soft delete)
   * 
   * Performs a soft delete on the specified assignee by setting the deletedAt
   * timestamp. The assignee remains in the database for audit purposes but
   * is excluded from normal queries.
   * 
   * @param actor - The user performing the action (provides tenant context)
   * @param assigneeId - The assignee ID to delete
   * @throws {TRPCError} When assignee not found or already deleted
   * 
   * @example
   * ```typescript
   * await assigneesService.deleteAssignee(currentUser, 'assignee-456');
   * ```
   */
  async deleteAssignee(actor: User, assigneeId: string): Promise<void> {
    const existingAssignee = await this.assigneesRepository.getById(assigneeId);

    if (!existingAssignee) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Assignee with ID ${assigneeId} not found`,
      });
    }

    // Check tenant isolation
    if (existingAssignee.tenantId !== actor.tenantId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete assignee from different tenant',
      });
    }

    await this.assigneesRepository.delete(assigneeId);
  }
}