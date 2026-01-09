-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "linearUserId" TEXT NOT NULL,
    "linearUserName" TEXT NOT NULL,
    "linearUserEmail" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "linearOrganizationId" TEXT NOT NULL,
    "linearOrganizationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "linearTeamId" TEXT NOT NULL,
    "linearTeamName" TEXT,
    "linearProjectId" TEXT,
    "linearProjectName" TEXT,
    "labelFilter" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssuePosition" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "xPosition" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IssuePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParkingLotOrder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "issueIds" TEXT[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParkingLotOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_linearUserId_key" ON "User"("linearUserId");

-- CreateIndex
CREATE INDEX "User_linearUserId_idx" ON "User"("linearUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_linearOrganizationId_key" ON "Workspace"("linearOrganizationId");

-- CreateIndex
CREATE INDEX "Workspace_linearOrganizationId_idx" ON "Workspace"("linearOrganizationId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_userId_idx" ON "WorkspaceUser"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceUser_workspaceId_idx" ON "WorkspaceUser"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUser_userId_workspaceId_key" ON "WorkspaceUser"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "Project_workspaceId_idx" ON "Project"("workspaceId");

-- CreateIndex
CREATE INDEX "Project_linearTeamId_idx" ON "Project"("linearTeamId");

-- CreateIndex
CREATE INDEX "IssuePosition_projectId_idx" ON "IssuePosition"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "IssuePosition_issueId_projectId_key" ON "IssuePosition"("issueId", "projectId");

-- CreateIndex
CREATE INDEX "ParkingLotOrder_projectId_idx" ON "ParkingLotOrder"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ParkingLotOrder_projectId_side_key" ON "ParkingLotOrder"("projectId", "side");

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssuePosition" ADD CONSTRAINT "IssuePosition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParkingLotOrder" ADD CONSTRAINT "ParkingLotOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
