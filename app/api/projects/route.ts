/**
 * Projects API Endpoint
 * GET: List all projects in workspace
 * POST: Create new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import { ProjectSchema } from '@/lib/storage/schemas';

export async function GET() {
  try {
    const { workspace } = await authenticateRequest();

    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { lastActivityAt: 'desc' },
      include: {
        lastActivityBy: {
          select: {
            id: true,
            linearUserName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const formatted = projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      linearTeamId: p.linearTeamId,
      linearTeamName: p.linearTeamName || undefined,
      linearProjectId: p.linearProjectId || undefined,
      linearProjectName: p.linearProjectName || undefined,
      labelFilter: p.labelFilter,
      color: p.color || undefined,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lastActivityAt: p.lastActivityAt.toISOString(),
      lastActivityBy: p.lastActivityBy ? {
        id: p.lastActivityBy.id,
        name: p.lastActivityBy.linearUserName,
        avatarUrl: p.lastActivityBy.avatarUrl || undefined,
      } : undefined,
    }));

    return NextResponse.json({ projects: formatted });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await authenticateRequest();
    const body = await request.json();

    // Validate project data
    const validatedData = ProjectSchema.parse(body);

    // Create project in database
    const project = await prisma.project.create({
      data: {
        id: validatedData.id,
        workspaceId: workspace.id,
        name: validatedData.name,
        description: validatedData.description,
        linearTeamId: validatedData.linearTeamId,
        linearTeamName: validatedData.linearTeamName,
        linearProjectId: validatedData.linearProjectId,
        linearProjectName: validatedData.linearProjectName,
        labelFilter: validatedData.labelFilter,
        color: validatedData.color,
        lastActivityByUserId: user.id,
      },
      include: {
        lastActivityBy: {
          select: {
            id: true,
            linearUserName: true,
            avatarUrl: true,
          },
        },
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
      lastActivityAt: project.lastActivityAt.toISOString(),
      lastActivityBy: project.lastActivityBy ? {
        id: project.lastActivityBy.id,
        name: project.lastActivityBy.linearUserName,
        avatarUrl: project.lastActivityBy.avatarUrl || undefined,
      } : undefined,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
