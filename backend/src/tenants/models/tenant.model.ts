/**
 * Tenant Domain Model
 * 
 * Simple interface representing a tenant entity.
 * Keeps model definition separate from Prisma-generated types for domain clarity.
 */
export interface Tenant {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}