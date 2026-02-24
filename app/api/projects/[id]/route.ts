/**
 * Project Detail API Endpoint
 * PATCH: Update project
 * DELETE: Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { workspace } = await authenticateRequest();
    const { id } = await params;
    const body = await request.json();

    // Verify project belongs to workspace
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        linearTeamId: body.linearTeamId,
        linearTeamName: body.linearTeamName,
        linearProjectId: body.linearProjectId,
        linearProjectName: body.linearProjectName,
        labelFilter: body.labelFilter,
        color: body.color,
        cachedBacklogCount: body.cachedBacklogCount,
        cachedCompletedCount: body.cachedCompletedCount,
      },
    });

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      linearTeamId: project.linearTeamId,
      linearTeamName: project.linearTeamName || undefined,
      linearProjectId: project.linearProjectId || undefined,
      linearProjectName: project.linearProjectName || undefined,
      labelFilter: project.labelFilter,
      color: project.color || undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { workspace } = await authenticateRequest();
    const { id } = await params;

    // Verify project belongs to workspace
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        workspaceId: workspace.id,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (cascade deletes positions and parking lot orders)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
