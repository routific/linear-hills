import { hillPositionToScreen } from "@/lib/utils/hillMath";
import { ExternalLink } from "lucide-react";
import { SubtaskProgress } from "@/components/ui/subtask-progress";
import type { LinearIssue, IssuePosition } from "@/types";

interface IssueCardProps {
  issue: LinearIssue;
  position: IssuePosition;
  chartWidth: number;
  chartHeight: number;
  isDragging?: boolean;
  compact?: boolean;
}

export function IssueCard({
  issue,
  position,
  chartWidth,
  chartHeight,
  isDragging = false,
  compact = false,
}: IssueCardProps) {
  const coords = hillPositionToScreen(
    position.xPosition,
    chartWidth,
    chartHeight
  );

  const cardWidth = compact ? 120 : 200;
  const cardHeight = compact ? 36 : 100;
  const cardX = coords.x - cardWidth / 2;
  const cardY = coords.y - cardHeight - 10;

  return (
    <g
      className={`transition-opacity ${
        isDragging ? "opacity-50" : "opacity-100"
      } cursor-move select-none`}
    >
      <foreignObject
        x={cardX}
        y={cardY}
        width={cardWidth}
        height={cardHeight}
      >
        {compact ? (
          <div className="w-full h-full px-2 flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all hover:border-primary/50 hover:bg-card/90 group select-none">
            <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {issue.identifier}
            </span>
            {issue.assignee && (
              <div className="flex-shrink-0 ml-auto">
                {issue.assignee.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={issue.assignee.avatarUrl}
                    alt={issue.assignee.name}
                    className="w-5 h-5 rounded-full ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-[10px] font-semibold ring-2 ring-primary/20">
                    {issue.assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all hover:border-primary/50 hover:bg-card/90 group select-none">
            <div className="flex items-start justify-between mb-1 gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {issue.identifier}
                </span>
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                </a>
              </div>
              {issue.assignee && (
                <div className="flex-shrink-0">
                  {issue.assignee.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.assignee.avatarUrl}
                      alt={issue.assignee.name}
                      className="w-5 h-5 rounded-full ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-[10px] font-semibold ring-2 ring-primary/20">
                      {issue.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mb-2">
              {issue.title}
            </p>
            <SubtaskProgress
              completed={issue.completedSubtaskCount}
              total={issue.subtaskCount}
              size={14}
            />
          </div>
        )}
      </foreignObject>

      <circle
        cx={coords.x}
        cy={coords.y}
        r="4"
        fill="currentColor"
        className="text-primary"
      />
    </g>
  );
}
