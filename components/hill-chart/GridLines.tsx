interface GridLinesProps {
  width: number;
  height: number;
}

export function GridLines({ width, height }: GridLinesProps) {
  const quarters = [0.25, 0.5, 0.75];

  return (
    <g className="text-muted-foreground/10">
      {quarters.map((fraction) => (
        <line
          key={fraction}
          x1={width * fraction}
          y1="0"
          x2={width * fraction}
          y2={height}
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}
