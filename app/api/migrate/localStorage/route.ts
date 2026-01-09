/**
 * LocalStorage Migration Endpoint
 * POST: Migrates data from localStorage to database (one-time migration)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';

interface LocalStorageData {
  projects: any[];
  issuePositions: any[];
  parkingLotOrders: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { workspace } = await authenticateRequest();
    const body: LocalStorageData = await request.json();

    const { projects, issuePositions, parkingLotOrders } = body;

    // Use transaction to ensure all-or-nothing migration
    await prisma.$transaction(async (tx) => {
      // Migrate projects
      for (const project of projects) {
        await tx.project.upsert({
          where: { id: project.id },
          create: {
            id: project.id,
            workspaceId: workspace.id,
            name: project.name,
            description: project.description,
            linearTeamId: project.linearTeamId,
            linearTeamName: project.linearTeamName,
            linearProjectId: project.linearProjectId,
            linearProjectName: project.linearProjectName,
            labelFilter: project.labelFilter,
            color: project.color,
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          },
          update: {
            // If project already exists (e.g., created on another device), update it
            name: project.name,
            description: project.description,
            linearTeamName: project.linearTeamName,
            linearProjectId: project.linearProjectId,
            linearProjectName: project.linearProjectName,
            labelFilter: project.labelFilter,
            color: project.color,
          },
        });
      }

      // Migrate issue positions
      for (const position of issuePositions) {
        await tx.issuePosition.upsert({
          where: {
            issueId_projectId: {
              issueId: position.issueId,
              projectId: position.projectId,
            },
          },
          create: {
            issueId: position.issueId,
            projectId: position.projectId,
            xPosition: position.xPosition,
            notes: position.notes,
            lastUpdated: new Date(position.lastUpdated),
          },
          update: {
            // Only update if local version is newer
            xPosition: position.xPosition,
            notes: position.notes,
            lastUpdated: new Date(position.lastUpdated),
          },
        });
      }

      // Migrate parking lot orders
      for (const order of parkingLotOrders) {
        await tx.parkingLotOrder.upsert({
          where: {
            projectId_side: {
              projectId: order.projectId,
              side: order.side,
            },
          },
          create: {
            projectId: order.projectId,
            side: order.side,
            issueIds: order.issueIds,
            lastUpdated: new Date(order.lastUpdated),
          },
          update: {
            issueIds: order.issueIds,
            lastUpdated: new Date(order.lastUpdated),
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      migrated: {
        projects: projects.length,
        issuePositions: issuePositions.length,
        parkingLotOrders: parkingLotOrders.length,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate localStorage data' },
      { status: 500 }
    );
  }
}
