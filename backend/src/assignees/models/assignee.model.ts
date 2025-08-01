/**
 * Assignee Domain Model
 * 
 * Simple interface representing an assignee entity.
 * Keeps model definition separate from Prisma-generated types for domain clarity.
 */
export interface Assignee {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  isActive: boolean;
  tenantId: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}