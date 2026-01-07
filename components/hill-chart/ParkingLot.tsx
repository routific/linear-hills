import { ExternalLink } from "lucide-react";
import { SubtaskProgress } from "@/components/ui/subtask-progress";
import type { LinearIssue } from "@/types";

interface ParkingLotProps {
  title: string;
  issues: LinearIssue[];
  emptyMessage: string;
}

export function ParkingLot({ title, issues, emptyMessage }: ParkingLotProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-4 text-center sticky top-0 bg-background/95 backdrop-blur-sm z-10 pb-3 border-b border-primary/20">
        {title}
        <span className="block text-xs font-normal text-muted-foreground mt-1">
          {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
        </span>
      </h3>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {issues.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted/30 mx-auto mb-3 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground">
              {emptyMessage}
            </p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="p-3 bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all hover:border-primary/50 hover:bg-card/80 group"
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {issue.identifier}
                  </span>
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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

              <p className="text-xs text-muted-foreground leading-snug line-clamp-2 mb-2">
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
