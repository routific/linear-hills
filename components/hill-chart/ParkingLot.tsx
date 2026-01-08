import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableIssueCard } from "./SortableIssueCard";
import type { LinearIssue } from "@/types";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/store/appStore";

interface ParkingLotProps {
  title: string;
  issues: LinearIssue[];
  emptyMessage: string;
  storageKey: string;
  side: "left" | "right";
  projectId: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const KeyboardHint = ({ keys }: { keys: string }) => (
  <kbd className="inline-flex items-center justify-center rounded border border-border/60 bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
    {keys}
  </kbd>
);

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 320;

export function ParkingLot({
  title,
  issues,
  emptyMessage,
  storageKey,
  side,
  projectId,
  isCollapsed: externalCollapsed,
  onToggleCollapse
}: ParkingLotProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(true);

  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const parkingLotOrders = useAppStore((state) => state.parkingLotOrders);
  const updateParkingLotOrder = useAppStore((state) => state.updateParkingLotOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort issues based on saved order
  const sortedIssues = useMemo(() => {
    const orderKey = `${projectId}-${side}`;
    const savedOrder = parkingLotOrders[orderKey];

    if (!savedOrder || savedOrder.issueIds.length === 0) {
      return issues;
    }

    // Create a map of issue IDs to their saved order index
    const orderMap = new Map(
      savedOrder.issueIds.map((id, index) => [id, index])
    );

    // Separate issues into ordered and new (not in saved order)
    const orderedIssues: LinearIssue[] = [];
    const newIssues: LinearIssue[] = [];

    issues.forEach((issue) => {
      if (orderMap.has(issue.id)) {
        orderedIssues.push(issue);
      } else {
        newIssues.push(issue);
      }
    });

    // Sort ordered issues by their saved position
    orderedIssues.sort((a, b) => {
      const aIndex = orderMap.get(a.id) ?? 0;
      const bIndex = orderMap.get(b.id) ?? 0;
      return aIndex - bIndex;
    });

    // Append new issues at the end
    return [...orderedIssues, ...newIssues];
  }, [issues, parkingLotOrders, projectId, side]);


  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedIssues.findIndex((issue) => issue.id === active.id);
    const newIndex = sortedIssues.findIndex((issue) => issue.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedIssues = arrayMove(sortedIssues, oldIndex, newIndex);
      updateParkingLotOrder(
        projectId,
        side,
        reorderedIssues.map((issue) => issue.id)
      );
    }
  };

  const CollapseIcon = isCollapsed
    ? side === "left"
      ? ChevronRight
      : ChevronLeft
    : side === "left"
      ? ChevronLeft
      : ChevronRight;

  const issuesLabel = `${sortedIssues.length} ${sortedIssues.length === 1 ? "issue" : "issues"}`;
  const keyboardShortcut = side === "left" ? "[" : "]";

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border/40 bg-card/50 shadow-sm transition-all duration-300 ease-in-out backdrop-blur",
        isCollapsed ? "items-center justify-center px-2 py-4" : "px-4 py-4"
      )}
      style={{
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        minWidth: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
      }}
    >
      <button
        onClick={toggleCollapse}
        className={cn(
          "group flex flex-col items-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200",
          isCollapsed
            ? "w-full flex-1 justify-center text-xs text-muted-foreground hover:bg-muted/20 px-1"
            : " mb-4 bg-background/95 pb-3 pt-2 text-center hover:bg-muted/20"
        )}
        aria-expanded={!isCollapsed}
        title={isCollapsed ? `${title} (${keyboardShortcut})` : undefined}
      >
        <CollapseIcon className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
        <span
          className={cn(
            "font-semibold text-foreground transition-colors duration-200",
            isCollapsed ? "text-[10px] uppercase tracking-wide text-muted-foreground writing-mode-vertical-rl" : ""
          )}
          style={isCollapsed ? { writingMode: 'vertical-rl', textOrientation: 'mixed' } : undefined}
        >
          {title}
        </span>
        {!isCollapsed && (
          <span className="text-xs font-normal text-muted-foreground mt-1">
            {issuesLabel}
          </span>
        )}
        {!isCollapsed && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <KeyboardHint keys={keyboardShortcut} />
          </div>
        )}
      </button>

      {isCollapsed && (
        <div className="mt-auto mb-2 flex flex-col items-center gap-2">
          <div className="text-[9px] text-muted-foreground font-medium">
            {sortedIssues.length}
          </div>
          <KeyboardHint keys={keyboardShortcut} />
        </div>
      )}

      <div
        className={cn(
          "flex-1 w-full space-y-3 overflow-y-auto pr-2 transition-opacity duration-200",
          isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        style={{ maxHeight: "600px" }}
      >
        {sortedIssues.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
              <div className="h-6 w-6 rounded-full bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedIssues.map((issue) => issue.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sortedIssues.map((issue) => (
                  <SortableIssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
