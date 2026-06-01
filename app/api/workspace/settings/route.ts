/**
 * Workspace Settings API
 * GET: returns workspace-level preferences
 * PATCH: updates defaultLabelFilter and backfills all project labelFilters
 */

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, AuthenticationError } from "@/lib/api/middleware/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const { workspace } = await authenticateRequest();
    return NextResponse.json({
      defaultLabelFilter: workspace.defaultLabelFilter,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Get workspace settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspace } = await authenticateRequest();
    const body = await request.json();
    const defaultLabelFilter =
      typeof body.defaultLabelFilter === "string" ? body.defaultLabelFilter.trim() : "";

    if (!defaultLabelFilter) {
      return NextResponse.json(
        { error: "defaultLabelFilter is required" },
        { status: 400 }
      );
    }

    const [updated] = await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspace.id },
        data: { defaultLabelFilter },
      }),
      prisma.project.updateMany({
        where: { workspaceId: workspace.id },
        data: { labelFilter: defaultLabelFilter },
      }),
    ]);

    return NextResponse.json({
      defaultLabelFilter: updated.defaultLabelFilter,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Update workspace settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
