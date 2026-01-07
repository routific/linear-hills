"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { HillCurve } from "./HillCurve";
import { GridLines } from "./GridLines";
import { IssueCard } from "./IssueCard";
import { ParkingLot } from "./ParkingLot";
import { useLinearIssues } from "@/lib/hooks/useLinearIssues";
import { useAppStore } from "@/lib/store/appStore";
import { screenToHillPosition } from "@/lib/utils/hillMath";
import type { LinearIssue, IssuePosition } from "@/types";

interface HillChartProps {
  projectId: string;
  teamId: string;
  linearProjectId?: string;
  labelFilter: string;
}

interface PositionedIssue {
  issue: LinearIssue;
  position: IssuePosition;
}

export function HillChart({ projectId, teamId, linearProjectId, labelFilter }: HillChartProps) {
  const { data: issues, isLoading, error } = useLinearIssues({
    teamId,
    projectId: linearProjectId,
    labelFilter,
  });

  const issuePositions = useAppStore((state) => state.issuePositions);
  const updateIssuePosition = useAppStore((state) => state.updateIssuePosition);

  // Filter issues by state type and name
  const { backlogIssues, inProgressIssues, doneIssues } = useMemo(() => {
    if (!issues) {
      return { backlogIssues: [], inProgressIssues: [], doneIssues: [] };
    }

    return {
      backlogIssues: issues.filter(
        (issue) =>
          (issue.state.type === "backlog" || issue.state.type === "unstarted") &&
          issue.state.name !== "Shaping"
      ),
      inProgressIssues: issues.filter(
        (issue) => issue.state.type === "started" || issue.state.name === "Shaping"
      ),
      doneIssues: issues.filter(
        (issue) => issue.state.type === "completed" || issue.state.type === "canceled"
      ),
    };
  }, [issues]);

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [tempPositions, setTempPositions] = useState<Record<string, number>>({});

  const positionedIssues: PositionedIssue[] = useMemo(() => {
    if (!inProgressIssues) return [];

    return inProgressIssues.map((issue) => {
      const existingPosition = issuePositions[issue.id];
      const tempPosition = tempPositions[issue.id];

      const position: IssuePosition = existingPosition || {
        issueId: issue.id,
        projectId,
        xPosition: 0.5,
        lastUpdated: new Date().toISOString(),
      };

      if (tempPosition !== undefined) {
        position.xPosition = tempPosition;
      }

      return { issue, position };
    });
  }, [inProgressIssues, issuePositions, projectId, tempPositions]);

  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 80, right: 40, bottom: 60, left: 40 };
  const svgWidth = chartWidth + padding.left + padding.right;
  const svgHeight = chartHeight + padding.top + padding.bottom;

  const handleDragStart = useCallback((issueId: string) => {
    setDraggingId(issueId);
  }, []);

  const handleDragMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggingId || !svgRef.current) return;

      const svg = svgRef.current;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left - padding.left;

      const newPosition = screenToHillPosition(x, chartWidth);

      setTempPositions((prev) => ({
        ...prev,
        [draggingId]: newPosition,
      }));
    },
    [draggingId, chartWidth, padding.left]
  );

  const handleDragEnd = useCallback(() => {
    if (draggingId && tempPositions[draggingId] !== undefined) {
      updateIssuePosition(draggingId, {
        issueId: draggingId,
        projectId,
        xPosition: tempPositions[draggingId],
        lastUpdated: new Date().toISOString(),
      });
    }

    setDraggingId(null);
    setTempPositions({});
  }, [draggingId, tempPositions, updateIssuePosition, projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Loading issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-destructive">
          Error loading issues: {(error as Error).message}
        </p>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            No issues found with label &quot;{labelFilter}&quot;
          </p>
          <p className="text-sm text-muted-foreground">
            Add the label to your Linear issues to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start gap-6">
        {/* Left Parking Lot - Backlog/Todo */}
        <ParkingLot
          title="Not Started"
          issues={backlogIssues}
          emptyMessage="No backlog items"
          storageKey={`parking-lot-left-${projectId}`}
          side="left"
        />

        {/* Center - Hill Chart */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="rounded-2xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm">
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              className="mx-auto"
              style={{ minWidth: svgWidth }}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              <g transform={`translate(${padding.left}, ${padding.top})`}>
                <text
                  x={chartWidth / 4}
                  y={-40}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-foreground/80"
                >
                  Figuring it out
                </text>
                <text
                  x={(chartWidth * 3) / 4}
                  y={-40}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-foreground/80"
                >
                  Making it happen
                </text>

                <GridLines width={chartWidth} height={chartHeight} />
                <HillCurve width={chartWidth} height={chartHeight} />

                {positionedIssues.map(({ issue, position }) => (
                  <g
                    key={issue.id}
                    onMouseDown={() => handleDragStart(issue.id)}
                    style={{ cursor: "move" }}
                  >
                    <IssueCard
                      issue={issue}
                      position={position}
                      chartWidth={chartWidth}
                      chartHeight={chartHeight}
                      isDragging={draggingId === issue.id}
                    />
                  </g>
                ))}

                <text
                  x={0}
                  y={chartHeight + 40}
                  className="text-xs fill-muted-foreground"
                >
                  0%
                </text>
                <text
                  x={chartWidth / 2}
                  y={chartHeight + 40}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                >
                  50%
                </text>
                <text
                  x={chartWidth}
                  y={chartHeight + 40}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  100%
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right Completion Area - Done */}
        <ParkingLot
          title="Completed"
          issues={doneIssues}
          emptyMessage="No completed items"
          storageKey={`parking-lot-right-${projectId}`}
          side="right"
        />
      </div>
    </div>
  );
}
