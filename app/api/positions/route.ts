/**
 * Issue Positions API Endpoint
 * POST: Upsert issue position on hill chart
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import { IssuePositionSchema } from '@/lib/storage/schemas';

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await authenticateRequest();
    const body = await request.json();

    // Validate position data
    const validatedData = IssuePositionSchema.parse(body);

    // Verify project belongs to workspace
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        workspaceId: workspace.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Check for conflicts (last-write-wins with timestamp)
    const existing = await prisma.issuePosition.findUnique({
      where: {
        issueId_projectId: {
          issueId: validatedData.issueId,
          projectId: validatedData.projectId,
        },
      },
    });

    if (existing && new Date(existing.lastUpdated) > new Date(validatedData.lastUpdated)) {
      // Server version is newer, reject update
      return NextResponse.json(
        {
          error: 'Conflict',
          latest: {
            issueId: existing.issueId,
            projectId: existing.projectId,
            xPosition: existing.xPosition,
            notes: existing.notes || undefined,
            lastUpdated: existing.lastUpdated.toISOString(),
          },
        },
        { status: 409 }
      );
    }

    // Upsert position with current timestamp
    const now = new Date();
    const position = await prisma.issuePosition.upsert({
      where: {
        issueId_projectId: {
          issueId: validatedData.issueId,
          projectId: validatedData.projectId,
        },
      },
      create: {
        issueId: validatedData.issueId,
        projectId: validatedData.projectId,
        xPosition: validatedData.xPosition,
        notes: validatedData.notes,
        lastUpdated: now,
      },
      update: {
        xPosition: validatedData.xPosition,
        notes: validatedData.notes,
        lastUpdated: now,
      },
    });

    // Update project's last activity
    await prisma.project.update({
      where: { id: validatedData.projectId },
      data: {
        lastActivityAt: now,
        lastActivityByUserId: user.id,
      },
    });

    return NextResponse.json({
      issueId: position.issueId,
      projectId: position.projectId,
      xPosition: position.xPosition,
      notes: position.notes || undefined,
      lastUpdated: position.lastUpdated.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Upsert position error:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
}
