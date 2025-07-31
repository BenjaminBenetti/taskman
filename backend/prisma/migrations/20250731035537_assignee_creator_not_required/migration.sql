-- DropForeignKey
ALTER TABLE "assignees" DROP CONSTRAINT "assignees_creatorId_fkey";

-- AlterTable
ALTER TABLE "assignees" ALTER COLUMN "creatorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "assignees" ADD CONSTRAINT "assignees_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
