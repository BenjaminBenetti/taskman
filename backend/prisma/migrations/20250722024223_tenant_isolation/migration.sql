/*
  Warnings:

  - Added the required column `tenantId` to the `assignees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignees" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "tenantId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "tenantId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignees" ADD CONSTRAINT "assignees_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
