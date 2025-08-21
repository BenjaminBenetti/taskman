import type { Assignee } from "@taskman/backend";
import { AbstractCliConverter } from "../../shared/converters/abstract.converter.ts";

/**
 * Serialized Assignee type representing how Assignee objects are received from TRPC
 * (with dates as strings instead of Date objects)
 */
export interface SerializedAssignee {
  id: string;
  name: string;
  email?: string | null | undefined;
  phone?: string | null | undefined;
  notes?: string | null | undefined;
  isActive: boolean;
  tenantId: string;
  creatorId: string | null;
  createdAt: string; // Date serialized as string
  updatedAt: string; // Date serialized as string
  deletedAt?: string | null; // Date serialized as string or null
}

/**
 * Assignee Converter for CLI
 * 
 * Handles conversion between serialized Assignee objects (as received from TRPC)
 * and proper Assignee domain models with Date objects. This follows the established
 * converter pattern used throughout the codebase by extending AbstractCliConverter.
 * 
 * Key responsibilities:
 * - Convert serialized Assignee data from TRPC to proper domain models
 * - Handle Date string to Date object conversion
 * - Maintain type safety and consistency with backend converters
 * - Provide array conversion capabilities through AbstractCliConverter
 */
export class AssigneeConverter extends AbstractCliConverter<Assignee, SerializedAssignee> {
  
  /**
   * Converts a serialized Assignee (from TRPC response) to an Assignee domain model
   * 
   * Transforms the serialized assignee data received from TRPC into a clean domain
   * object with proper Date objects. This handles the conversion of date strings
   * back to Date objects as expected by the Assignee interface.
   * 
   * @param serializedAssignee - The serialized Assignee data from TRPC response
   * @returns Clean Assignee domain model with proper Date objects
   * @throws {Error} When serializedAssignee is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const trpcResponse = await trpcClient.assignees.list.query();
   * const assigneeDomain = assigneeConverter.fromSerialized(trpcResponse[0]);
   * console.log(assigneeDomain.createdAt instanceof Date); // true
   * ```
   */
  fromSerialized(serializedAssignee: SerializedAssignee): Assignee {
    if (!serializedAssignee) {
      throw new Error("Cannot convert null or undefined serialized assignee");
    }

    return {
      id: serializedAssignee.id,
      name: serializedAssignee.name,
      email: serializedAssignee.email ?? null,
      phone: serializedAssignee.phone ?? null,
      notes: serializedAssignee.notes ?? null,
      isActive: serializedAssignee.isActive,
      tenantId: serializedAssignee.tenantId,
      creatorId: serializedAssignee.creatorId,
      createdAt: new Date(serializedAssignee.createdAt),
      updatedAt: new Date(serializedAssignee.updatedAt),
      deletedAt: serializedAssignee.deletedAt ? new Date(serializedAssignee.deletedAt) : null,
    };
  }

  /**
   * Converts an Assignee domain model to serialized format
   * 
   * Transforms an Assignee domain model back to the serialized format with date
   * strings. This is useful for testing or when preparing data for transmission.
   * 
   * @param assignee - The Assignee domain model to serialize
   * @returns Serialized Assignee with date strings
   * @throws {Error} When assignee is null, undefined, or malformed
   * 
   * @example
   * ```typescript
   * const assigneeDomain: Assignee = { ... };
   * const serialized = assigneeConverter.toSerialized(assigneeDomain);
   * console.log(typeof serialized.createdAt); // "string"
   * ```
   */
  toSerialized(assignee: Assignee): SerializedAssignee {
    if (!assignee) {
      throw new Error("Cannot convert null or undefined assignee");
    }

    return {
      id: assignee.id,
      name: assignee.name,
      email: assignee.email,
      phone: assignee.phone,
      notes: assignee.notes,
      isActive: assignee.isActive,
      tenantId: assignee.tenantId,
      creatorId: assignee.creatorId,
      createdAt: assignee.createdAt.toISOString(),
      updatedAt: assignee.updatedAt.toISOString(),
      deletedAt: assignee.deletedAt ? assignee.deletedAt.toISOString() : null,
    };
  }

  /**
   * Provides the entity type name for error messages
   * 
   * Overrides the base class method to provide specific entity type
   * identification for Assignee converter error messages.
   * 
   * @returns The entity type name used in error messages
   */
  protected override getEntityTypeName(): string {
    return 'Assignee';
  }
}

/**
 * Singleton instance of AssigneeConverter for application-wide use
 * 
 * Provides a single, reusable converter instance to avoid unnecessary
 * object creation overhead. This pattern ensures consistent conversion
 * behavior across the entire CLI application.
 * 
 * @example
 * ```typescript
 * import { assigneeConverter } from './assignee.converter.ts';
 * 
 * // Use singleton instance directly
 * const assigneeDomain = assigneeConverter.fromSerialized(trpcResponse);
 * ```
 */
export const assigneeConverter = new AssigneeConverter();
