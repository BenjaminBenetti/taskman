import type { TRPCClient } from "@trpc/client";
import type {
  Assignee,
  TaskmanRouter,
  AssigneeIdInput,
  CreateAssigneeInput,
  UpdateAssigneeInput,
  GetAssigneesInput,
} from "@taskman/backend";
import { TrpcClientFactory } from "../../trpc/factory/trpc-client.factory.ts";
import { assigneeConverter, type SerializedAssignee } from "../converters/assignee.converter.ts";

/**
 * Assignee Service for CLI
 * 
 * Provides a simple interface for retrieving and saving assignees through TRPC.
 * Handles conversion between serialized data from TRPC and proper domain models
 * with Date objects. This service follows the established pattern used throughout
 * the CLI application.
 * 
 * Key responsibilities:
 * - Create new assignees with validation
 * - Retrieve assignees by ID or with filtering
 * - Update existing assignees
 * - Delete assignees (soft delete)
 * - Convert between serialized and domain model formats
 * - Provide type-safe operations with proper error handling
 */
export class AssigneeService {
  private client?: TRPCClient<TaskmanRouter>;

  /**
   * Get or create the authenticated TRPC client
   * 
   * @returns Promise that resolves to the TRPC client
   * @throws Error if authentication fails
   */
  private async getClient(): Promise<TRPCClient<TaskmanRouter>> {
    if (!this.client) {
      this.client = await TrpcClientFactory.create();
    }
    return this.client;
  }

  /**
   * Create a new assignee
   * 
   * Creates a new assignee with the provided data. Validates input and
   * converts the response to a proper domain model with Date objects.
   * 
   * @param input - The assignee creation data
   * @returns Promise that resolves to the created Assignee domain model
   * @throws Error when creation fails or validation errors occur
   * 
   * @example
   * ```typescript
   * const assigneeService = new AssigneeService();
   * const newAssignee = await assigneeService.createAssignee({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   phone: '+1-555-0123',
   *   notes: 'Senior developer',
   *   isActive: true
   * });
   * console.log(newAssignee.createdAt instanceof Date); // true
   * ```
   */
  async createAssignee(input: CreateAssigneeInput): Promise<Assignee> {
    const client = await this.getClient();

    const serializedAssignee = await client.assignees.create.mutate(input);

    return assigneeConverter.fromSerialized(serializedAssignee as SerializedAssignee);
  }

  /**
   * Get an assignee by ID
   *
   * Retrieves a specific assignee by ID and converts it to a domain model.
   * Returns null if the assignee is not found.
   *
   * @param input - The assignee ID input with validation
   * @returns Promise that resolves to the Assignee domain model or null
   * @throws Error when the request fails or assignee ID is invalid
   *
   * @example
   * ```typescript
   * const assigneeService = new AssigneeService();
   * const assignee = await assigneeService.getAssigneeById({ assigneeId: 'assignee-123' });
   * if (assignee) {
   *   console.log(assignee.name);
   * }
   * ```
   */
  async getAssigneeById(input: AssigneeIdInput): Promise<Assignee | null> {
    const client = await this.getClient();

    const serializedAssignee = await client.assignees.get.query(input);

    if (!serializedAssignee) {
      return null;
    }

    return assigneeConverter.fromSerialized(serializedAssignee as SerializedAssignee);
  }

  /**
   * Search for assignees with filtering and pagination
   *
   * Retrieves assignees based on filter criteria and converts them to domain models.
   * Supports filtering by active status, creator, text search, and pagination.
   *
   * @param filters - Optional filter criteria and pagination options
   * @returns Promise that resolves to an array of Assignee domain models
   * @throws Error when the request fails or filter parameters are invalid
   *
   * @example
   * ```typescript
   * const assigneeService = new AssigneeService();
   *
   * // Get all active assignees
   * const activeAssignees = await assigneeService.searchAssignees({
   *   isActive: true,
   *   limit: 50
   * });
   *
   * // Search by name or email
   * const searchResults = await assigneeService.searchAssignees({
   *   search: 'john',
   *   limit: 10
   * });
   * ```
   */
  async searchAssignees(filters: GetAssigneesInput = {}): Promise<Assignee[]> {
    const client = await this.getClient();

    const serializedAssignees = await client.assignees.search.query(filters);

    return assigneeConverter.fromSerializedArray(serializedAssignees as SerializedAssignee[]);
  }

  /**
   * Update an existing assignee
   * 
   * Updates an assignee with the provided data. Supports partial updates
   * and converts the response to a proper domain model with Date objects.
   * 
   * @param input - The assignee update data including the assignee ID
   * @returns Promise that resolves to the updated Assignee domain model
   * @throws Error when update fails, assignee not found, or validation errors occur
   * 
   * @example
   * ```typescript
   * const assigneeService = new AssigneeService();
   * const updatedAssignee = await assigneeService.updateAssignee({
   *   assigneeId: 'assignee-123',
   *   name: 'Jane Doe',
   *   email: 'jane@example.com'
   * });
   * console.log(updatedAssignee.updatedAt instanceof Date); // true
   * ```
   */
  async updateAssignee(input: UpdateAssigneeInput): Promise<Assignee> {
    const client = await this.getClient();

    const serializedAssignee = await client.assignees.update.mutate(input);

    return assigneeConverter.fromSerialized(serializedAssignee as SerializedAssignee);
  }

  /**
   * Delete an assignee (soft delete)
   *
   * Performs a soft delete on the specified assignee. The assignee is marked
   * as deleted but remains in the database for audit purposes.
   *
   * @param input - The assignee ID input with validation
   * @returns Promise that resolves when the deletion is complete
   * @throws Error when deletion fails or assignee not found
   *
   * @example
   * ```typescript
   * const assigneeService = new AssigneeService();
   * await assigneeService.deleteAssignee({ assigneeId: 'assignee-123' });
   * console.log('Assignee deleted successfully');
   * ```
   */
  async deleteAssignee(input: AssigneeIdInput): Promise<void> {
    const client = await this.getClient();

    await client.assignees.delete.mutate(input);
  }
}

/**
 * Singleton instance of AssigneeService for application-wide use
 * 
 * Provides a single, reusable service instance to avoid unnecessary
 * object creation overhead and maintain consistent client connections.
 * 
 * @example
 * ```typescript
 * import { assigneeService } from './assignee.service.ts';
 * 
 * // Use singleton instance directly
 * const assignees = await assigneeService.searchAssignees();
 * ```
 */
export const assigneeService = new AssigneeService();
