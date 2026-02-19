"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { HillCurve } from "./HillCurve";
import { GridLines } from "./GridLines";
import { IssueCard } from "./IssueCard";
import { ParkingLot } from "./ParkingLot";
import { useLinearIssues } from "@/lib/hooks/useLinearIssues";
import { useAppStore } from "@/lib/store/appStore";
import { useWorkspaceData } from "@/lib/hooks/useWorkspaceData";
import { useUpdateIssuePosition } from "@/lib/hooks/mutations/useUpdateIssuePosition";
import { screenToHillPosition } from "@/lib/utils/hillMath";
import { Minimize2, Maximize2 } from "lucide-react";
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

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const storePositions = useAppStore((state) => state.issuePositions);

  // Use workspace data if authenticated, otherwise fall back to store
  const { data: workspaceData } = useWorkspaceData();
  const issuePositions = isAuthenticated && workspaceData
    ? workspaceData.issuePositions
    : storePositions;

  const updatePositionMutation = useUpdateIssuePosition();
  const updateIssuePositionStore = useAppStore((state) => state.updateIssuePosition);

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
  const [leftCollapsed, setLeftCollapsed] = useState(true);
  const [rightCollapsed, setRightCollapsed] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [hoveredIssueId, setHoveredIssueId] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const leftKey = `parking-lot-left-${projectId}`;
    const rightKey = `parking-lot-right-${projectId}`;
    const compactKey = `hill-compact-mode-${projectId}`;

    const savedLeft = localStorage.getItem(leftKey);
    const savedRight = localStorage.getItem(rightKey);
    const savedCompact = localStorage.getItem(compactKey);

    if (savedLeft !== null) {
      setLeftCollapsed(JSON.parse(savedLeft));
    }
    if (savedRight !== null) {
      setRightCollapsed(JSON.parse(savedRight));
    }
    if (savedCompact !== null) {
      setCompactMode(JSON.parse(savedCompact));
    }
  }, [projectId]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`parking-lot-left-${projectId}`, JSON.stringify(leftCollapsed));
  }, [leftCollapsed, projectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`parking-lot-right-${projectId}`, JSON.stringify(rightCollapsed));
  }, [rightCollapsed, projectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`hill-compact-mode-${projectId}`, JSON.stringify(compactMode));
  }, [compactMode, projectId]);

  // Keyboard shortcuts for toggling parking lots
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '[') {
        e.preventDefault();
        setLeftCollapsed((prev) => !prev);
      } else if (e.key === ']') {
        e.preventDefault();
        setRightCollapsed((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCompactMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const chartWidth = 1000;
  const chartHeight = 300;
  const padding = { top: 150, right: 160, bottom: 60, left: 160 };
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
      const position = {
        issueId: draggingId,
        projectId,
        xPosition: tempPositions[draggingId],
        lastUpdated: new Date().toISOString(),
      };

      // Use mutation for authenticated users, store for unauthenticated
      if (isAuthenticated) {
        updatePositionMutation.mutate(position);
      } else {
        updateIssuePositionStore(draggingId, position);
      }
    }

    setDraggingId(null);
    setTempPositions({});
  }, [draggingId, tempPositions, projectId, isAuthenticated, updatePositionMutation, updateIssuePositionStore]);

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
      <div className="flex items-stretch gap-6" style={{ minHeight: `${svgHeight}px` }}>
        {/* Left Parking Lot - Backlog/Todo */}
        <ParkingLot
          title="Not Started"
          issues={backlogIssues}
          emptyMessage="No backlog items"
          storageKey={`parking-lot-left-${projectId}`}
          side="left"
          projectId={projectId}
          isCollapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed((prev) => !prev)}
          compact={compactMode}
        />

        {/* Center - Hill Chart */}
        <div className="min-w-0 flex-1 overflow-x-auto flex flex-col">
          <div className="relative rounded-2xl border border-border/30 bg-card/30 p-6 backdrop-blur-sm flex-1 flex items-center justify-center">
            <button
              onClick={() => setCompactMode((prev) => !prev)}
              className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 bg-card/80 text-muted-foreground hover:text-foreground hover:bg-card transition-colors text-xs"
              title={compactMode ? "Expand cards (C)" : "Compact cards (C)"}
            >
              {compactMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              <span>Compact mode</span>
              <kbd className="ml-1 rounded border border-border/60 bg-muted/30 px-1 py-0.5 text-[10px] font-medium shadow-sm">C</kbd>
            </button>
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              className="mx-auto select-none"
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

                {positionedIssues
                  .filter(({ issue }) => issue.id !== hoveredIssueId)
                  .map(({ issue, position }) => (
                    <g
                      key={issue.id}
                      onMouseDown={() => handleDragStart(issue.id)}
                      onMouseEnter={() => setHoveredIssueId(issue.id)}
                      onMouseLeave={() => setHoveredIssueId(null)}
                      style={{ cursor: "move" }}
                    >
                      <IssueCard
                        issue={issue}
                        position={position}
                        chartWidth={chartWidth}
                        chartHeight={chartHeight}
                        isDragging={draggingId === issue.id}
                        compact={compactMode}
                      />
                    </g>
                  ))}
                {/* Render hovered card last so it paints on top */}
                {hoveredIssueId && (() => {
                  const hovered = positionedIssues.find(({ issue }) => issue.id === hoveredIssueId);
                  if (!hovered) return null;
                  const { issue, position } = hovered;
                  return (
                    <g
                      key={issue.id}
                      onMouseDown={() => handleDragStart(issue.id)}
                      onMouseLeave={() => setHoveredIssueId(null)}
                      style={{ cursor: "move" }}
                    >
                      <IssueCard
                        issue={issue}
                        position={position}
                        chartWidth={chartWidth}
                        chartHeight={chartHeight}
                        isDragging={draggingId === issue.id}
                        compact={compactMode}
                      />
                    </g>
                  );
                })()}

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
          projectId={projectId}
          isCollapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed((prev) => !prev)}
          compact={compactMode}
        />
      </div>
    </div>
  );
}
