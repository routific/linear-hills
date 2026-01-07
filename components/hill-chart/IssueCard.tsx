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
          <div className="w-full h-full p-3 bg-card border border-border rounded-lg shadow-md hover:shadow-lg transition-shadow hover:border-primary/50">
            <div className="flex items-start justify-between mb-1">
              <span className="text-sm font-semibold text-foreground truncate">
                {issue.identifier}
              </span>
              {issue.assignee && (
                <div className="flex-shrink-0">
                  {issue.assignee.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.assignee.avatarUrl}
                      alt={issue.assignee.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
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
