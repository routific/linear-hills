/**
 * Parking Lot Order API Endpoint
 * POST: Upsert parking lot order for a project side
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthenticationError } from '@/lib/api/middleware/auth';
import { prisma } from '@/lib/db/prisma';
import { ParkingLotOrderSchema } from '@/lib/storage/schemas';

export async function POST(request: NextRequest) {
  try {
    const { user, workspace } = await authenticateRequest();
    const body = await request.json();

    // Validate parking lot order data
    const validatedData = ParkingLotOrderSchema.parse(body);

    // Verify project belongs to workspace and update activity in one query
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

    // Upsert parking lot order
    const order = await prisma.parkingLotOrder.upsert({
      where: {
        projectId_side: {
          projectId: validatedData.projectId,
          side: validatedData.side,
        },
      },
      create: {
        projectId: validatedData.projectId,
        side: validatedData.side,
        issueIds: validatedData.issueIds,
        lastUpdated: now,
      },
      update: {
        issueIds: validatedData.issueIds,
        lastUpdated: now,
      },
    });

    return NextResponse.json({
      projectId: order.projectId,
      side: order.side,
      issueIds: order.issueIds,
      lastUpdated: order.lastUpdated.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error('Upsert parking lot order error:', error);
    return NextResponse.json(
      { error: 'Failed to update parking lot order' },
      { status: 500 }
    );
  }
}
