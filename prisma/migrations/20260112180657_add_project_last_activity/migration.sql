-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastActivityByUserId" TEXT;

-- CreateIndex
CREATE INDEX "Project_lastActivityByUserId_idx" ON "Project"("lastActivityByUserId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_lastActivityByUserId_fkey" FOREIGN KEY ("lastActivityByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
