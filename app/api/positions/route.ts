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

    // Verify project belongs to workspace and update activity in one query
    // Returns null if project doesn't exist or doesn't belong to workspace
    const now = new Date();
    const project = await prisma.project.updateMany({
      where: {
        id: validatedData.projectId,
        workspaceId: workspace.id,
      },
      data: {
        lastActivityAt: now,
        lastActivityByUserId: user.id,
      },
    });

    if (project.count === 0) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Check for conflicts and upsert in a single transaction
    const position = await prisma.$transaction(async (tx) => {
      const existing = await tx.issuePosition.findUnique({
        where: {
          issueId_projectId: {
            issueId: validatedData.issueId,
            projectId: validatedData.projectId,
          },
        },
      });

      if (existing && new Date(existing.lastUpdated) > new Date(validatedData.lastUpdated)) {
        return { conflict: true, existing } as const;
      }

      const result = await tx.issuePosition.upsert({
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

      return { conflict: false, result } as const;
    });

    if (position.conflict) {
      const { existing } = position;
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

    const { result } = position;
    return NextResponse.json({
      issueId: result.issueId,
      projectId: result.projectId,
      xPosition: result.xPosition,
      notes: result.notes || undefined,
      lastUpdated: result.lastUpdated.toISOString(),
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
