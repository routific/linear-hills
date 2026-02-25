/**
 * Position Cleanup Endpoint
 * POST: Delete stale positions for issues no longer in-progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const { workspace } = await authenticateRequest();
    const { projectId, activeIssueIds } = await request.json();

    if (!projectId || !Array.isArray(activeIssueIds)) {
      return NextResponse.json(
        { error: 'projectId and activeIssueIds are required' },
        { status: 400 }
      );
    }

    // Verify project belongs to workspace
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId: workspace.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' },
        { status: 404 }
      );
    }

    // Delete positions for issues no longer on the hill
    const { count } = await prisma.issuePosition.deleteMany({
      where: {
        projectId,
        issueId: { notIn: activeIssueIds },
      },
    });

    return NextResponse.json({ deleted: count });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Position cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to clean up positions' },
      { status: 500 }
    );
  }
}
