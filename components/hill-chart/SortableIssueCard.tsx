import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink } from "lucide-react";
import { SubtaskProgress } from "@/components/ui/subtask-progress";
import type { LinearIssue } from "@/types";
import { cn } from "@/lib/utils/cn";

interface SortableIssueCardProps {
  issue: LinearIssue;
  compact?: boolean;
}

export function SortableIssueCard({ issue, compact = false }: SortableIssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const [hovered, setHovered] = useState(false);
  const showFull = !compact || hovered;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group rounded-xl border border-border/50 bg-card/60 shadow-sm backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 cursor-move select-none",
        compact && !hovered ? "px-2 py-1.5" : "p-3",
        compact && hovered && "relative z-10"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn("flex items-center gap-2", showFull && "mb-2 items-start justify-between")}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
            {issue.identifier}
          </span>
          {showFull && (
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
            </a>
          )}
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

      {showFull && (
        <>
          <p className="mb-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {issue.title}
          </p>

          <SubtaskProgress
            completed={issue.completedSubtaskCount}
            total={issue.subtaskCount}
            size={14}
          />
        </>
      )}
    </div>
  );
}
