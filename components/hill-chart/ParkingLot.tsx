import type { LinearIssue } from "@/types";

interface ParkingLotProps {
  title: string;
  issues: LinearIssue[];
  emptyMessage: string;
}

export function ParkingLot({ title, issues, emptyMessage }: ParkingLotProps) {
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold mb-3 text-center sticky top-0 bg-background z-10 pb-2 border-b">
        {title}
      </h3>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {issues.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {emptyMessage}
          </p>
        ) : (
          issues.map((issue) => (
            <a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
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

              <p className="text-sm text-muted-foreground leading-snug">
                {issue.title}
              </p>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
