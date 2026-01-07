import { generateHillPath } from "@/lib/utils/hillMath";

interface HillCurveProps {
  width: number;
  height: number;
}

export function HillCurve({ width, height }: HillCurveProps) {
  const path = generateHillPath(width, height);

  return (
    <g>
      <defs>
        <linearGradient id="hillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#hillGradient)"
        className="transition-all"
      />

      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-border"
      />

      <line
        x1={width / 2}
        y1="0"
        x2={width / 2}
        y2={height}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 4"
        className="text-muted-foreground/30"
      />
    </g>
  );
}
