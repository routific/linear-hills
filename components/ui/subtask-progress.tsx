interface SubtaskProgressProps {
  completed: number;
  total: number;
  size?: number;
}

export function SubtaskProgress({ completed, total, size = 16 }: SubtaskProgressProps) {
  if (total === 0) return null;

  const percentage = (completed / total) * 100;
  const radius = (size - 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              percentage === 100 ? 'text-primary' : 'text-primary/70'
            }`}
          />
        </svg>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
        {completed}/{total}
      </span>
    </div>
  );
}
