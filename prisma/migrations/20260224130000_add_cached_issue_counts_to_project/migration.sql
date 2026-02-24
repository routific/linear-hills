-- AlterTable
ALTER TABLE "Project" ADD COLUMN "cachedBacklogCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "cachedCompletedCount" INTEGER NOT NULL DEFAULT 0;
