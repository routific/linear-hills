/**
 * Data Sync Endpoint
 * Returns all workspace data (projects, positions, orders) for authenticated user
 */

import { NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    // Authenticate and get workspace context
    const { workspace } = await authenticateRequest();

    // Fetch all projects for the workspace
    const projects = await prisma.project.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all issue positions for workspace projects
    const issuePositions = await prisma.issuePosition.findMany({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    });

    // Fetch all parking lot orders for workspace projects
    const parkingLotOrders = await prisma.parkingLotOrder.findMany({
      where: {
        project: {
          workspaceId: workspace.id,
        },
      },
    });

    // Transform issue positions to Record format (matches Zustand store structure)
    const issuePositionsRecord = issuePositions.reduce(
      (acc, pos) => {
        acc[pos.issueId] = {
          issueId: pos.issueId,
          projectId: pos.projectId,
          xPosition: pos.xPosition,
          notes: pos.notes || undefined,
          lastUpdated: pos.lastUpdated.toISOString(),
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Transform parking lot orders to Record format
    const parkingLotOrdersRecord = parkingLotOrders.reduce(
      (acc, order) => {
        const key = `${order.projectId}-${order.side}`;
        acc[key] = {
          projectId: order.projectId,
          side: order.side,
          issueIds: order.issueIds,
          lastUpdated: order.lastUpdated.toISOString(),
        };
        return acc;
      },
      {} as Record<string, any>
    );

    // Transform projects to match existing format
    const projectsFormatted = projects.map((p) => ({
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
    }));

    return NextResponse.json({
      projects: projectsFormatted,
      issuePositions: issuePositionsRecord,
      parkingLotOrders: parkingLotOrdersRecord,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Data sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
