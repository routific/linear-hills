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
          <stop offset="0%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.15" />
          <stop offset="50%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="hillStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.3" />
          <stop offset="50%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(263, 70%, 60%)" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Glow effect under the curve */}
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#hillGradient)"
        className="transition-all"
        style={{ filter: 'blur(8px)' }}
        opacity="0.6"
      />

      {/* Main fill */}
      <path
        d={`${path} L ${width} ${height} L 0 ${height} Z`}
        fill="url(#hillGradient)"
        className="transition-all"
      />

      {/* Stroke with gradient */}
      <path
        d={path}
        fill="none"
        stroke="url(#hillStroke)"
        strokeWidth="2.5"
      />

      {/* Center divider line */}
      <line
        x1={width / 2}
        y1="0"
        x2={width / 2}
        y2={height}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 6"
        className="text-primary/20"
      />
    </g>
  );
}
