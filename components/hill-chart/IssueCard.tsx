import { hillPositionToScreen } from "@/lib/utils/hillMath";
import type { LinearIssue, IssuePosition } from "@/types";

interface IssueCardProps {
  issue: LinearIssue;
  position: IssuePosition;
  chartWidth: number;
  chartHeight: number;
  isDragging?: boolean;
}

export function IssueCard({
  issue,
  position,
  chartWidth,
  chartHeight,
  isDragging = false,
}: IssueCardProps) {
  const coords = hillPositionToScreen(
    position.xPosition,
    chartWidth,
    chartHeight
  );

  const cardWidth = 160;
  const cardHeight = 80;
  const cardX = coords.x - cardWidth / 2;
  const cardY = coords.y - cardHeight - 10;

  return (
    <g
      className={`transition-opacity ${
        isDragging ? "opacity-50" : "opacity-100"
      } cursor-move`}
    >
      <foreignObject
        x={cardX}
        y={cardY}
        width={cardWidth}
        height={cardHeight}
      >
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
          onClick={(e) => {
            // Prevent link navigation when dragging
            if (isDragging) {
              e.preventDefault();
            }
          }}
        >
          <div className="w-full h-full p-3 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all hover:border-primary/50 hover:bg-card/90 group">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {issue.identifier}
              </span>
              {issue.assignee && (
                <div className="flex-shrink-0">
                  {issue.assignee.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.assignee.avatarUrl}
                      alt={issue.assignee.name}
                      className="w-6 h-6 rounded-full ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center text-xs font-semibold ring-2 ring-primary/20">
                      {issue.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 leading-snug">
              {issue.title}
            </p>
          </div>
        </a>
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
