import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { SubtaskProgress } from "@/components/ui/subtask-progress";
import { useState, useEffect, useRef } from "react";
import type { LinearIssue } from "@/types";
import { cn } from "@/lib/utils/cn";

interface ParkingLotProps {
  title: string;
  issues: LinearIssue[];
  emptyMessage: string;
  storageKey: string;
  side: "left" | "right";
}

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 320;

export function ParkingLot({ title, issues, emptyMessage, storageKey, side }: ParkingLotProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!hasInitialized.current) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
      hasInitialized.current = true;
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(isCollapsed));
  }, [isCollapsed, storageKey]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const CollapseIcon = isCollapsed
    ? side === "left"
      ? ChevronRight
      : ChevronLeft
    : side === "left"
      ? ChevronLeft
      : ChevronRight;

  const issuesLabel = `${issues.length} ${issues.length === 1 ? "issue" : "issues"}`;

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
            ? "w-full flex-1 justify-center text-xs text-muted-foreground hover:bg-muted/20"
            : " mb-4 bg-background/95 pb-3 pt-2 text-center hover:bg-muted/20"
        )}
        aria-expanded={!isCollapsed}
      >
        <CollapseIcon className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
        <span
          className={cn(
            "font-semibold text-foreground transition-colors duration-200",
            isCollapsed ? "text-[10px] uppercase tracking-wide text-muted-foreground" : ""
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "text-xs font-normal text-muted-foreground transition-opacity duration-200",
            isCollapsed ? "text-[9px]" : "mt-1"
          )}
        >
          {issuesLabel}
        </span>
      </button>

      <div
        className={cn(
          "flex-1 w-full space-y-3 overflow-y-auto pr-2 transition-opacity duration-200",
          isCollapsed ? "pointer-events-none opacity-0" : "opacity-100"
        )}
        style={{ maxHeight: "600px" }}
      >
        {issues.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/30">
              <div className="h-6 w-6 rounded-full bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="group rounded-xl border border-border/50 bg-card/60 p-3 shadow-sm backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                    {issue.identifier}
                  </span>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                  </a>
                </div>
                {issue.assignee && (
                  <div className="flex-shrink-0">
                    {issue.assignee.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={issue.assignee.avatarUrl}
                        alt={issue.assignee.name}
                        className="h-5 w-5 rounded-full ring-2 ring-primary/20"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground ring-2 ring-primary/20">
                        {issue.assignee.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="mb-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
                {issue.title}
              </p>

              <SubtaskProgress
                completed={issue.completedSubtaskCount}
                total={issue.subtaskCount}
                size={14}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
