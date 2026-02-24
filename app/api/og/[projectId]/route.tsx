import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";

// Inlined hill math (pure functions, safe for server-side use)
function calculateHillY(x: number): number {
  const normalized = x / 100;
  const sigma = 0.25;
  const peak = 0.5;
  const exponent = -Math.pow(normalized - peak, 2) / (2 * Math.pow(sigma, 2));
  return Math.exp(exponent) * 100;
}

function generateHillPath(width: number, height: number): string {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= 100; i++) {
    points.push({
      x: (i / 100) * width,
      y: height - (calculateHillY(i) / 100) * height,
    });
  }
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
  }
  return path;
}

function hillPositionToScreen(
  xPosition: number,
  chartWidth: number,
  chartHeight: number
): { x: number; y: number } {
  return {
    x: (xPosition / 100) * chartWidth,
    y: chartHeight - (calculateHillY(xPosition) / 100) * chartHeight,
  };
}

const CHART_WIDTH = 1080;
const CHART_HEIGHT = 230;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { issuePositions: true },
  });

  if (!project) {
    return new Response("Not found", { status: 404 });
  }

  const hillPath = generateHillPath(CHART_WIDTH, CHART_HEIGHT);
  const filledPath = `${hillPath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* App name */}
        <div
          style={{
            color: "#6b7280",
            fontSize: 13,
            letterSpacing: "0.08em",
            marginBottom: 24,
            display: "flex",
          }}
        >
          LINEAR HILL CHARTS
        </div>

        {/* Project name */}
        <div
          style={{
            color: "#f9fafb",
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: project.description ? 10 : 0,
            display: "flex",
          }}
        >
          {project.name}
        </div>

        {/* Description */}
        {project.description && (
          <div
            style={{
              color: "#9ca3af",
              fontSize: 18,
              marginBottom: 0,
              display: "flex",
            }}
          >
            {project.description.length > 100
              ? project.description.slice(0, 100) + "…"
              : project.description}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: 12 }}>
          {/* Hill chart SVG */}
          <svg
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            {/* Filled area under curve */}
            <path d={filledPath} fill="rgba(139,92,246,0.12)" />

            {/* Curve outline */}
            <path
              d={hillPath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeOpacity="0.6"
            />

            {/* Center divider */}
            <line
              x1={CHART_WIDTH / 2}
              y1="0"
              x2={CHART_WIDTH / 2}
              y2={CHART_HEIGHT}
              stroke="#8b5cf6"
              strokeWidth="1.5"
              strokeOpacity="0.2"
              strokeDasharray="6 6"
            />

            {/* Issue dots */}
            {project.issuePositions.map((pos) => {
              const { x, y } = hillPositionToScreen(
                pos.xPosition,
                CHART_WIDTH,
                CHART_HEIGHT
              );
              return (
                <circle
                  key={pos.issueId}
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#8b5cf6"
                  opacity="0.9"
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              color: "#4b5563",
              fontSize: 13,
            }}
          >
            <span>Figuring it out</span>
            <span>Making it happen</span>
          </div>
        </div>

        {/* Footer stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid #1f2937",
            color: "#6b7280",
            fontSize: 14,
          }}
        >
          <span>
            {project.issuePositions.length}{" "}
            {project.issuePositions.length === 1 ? "issue" : "issues"} on hill
          </span>
          <span style={{ color: "#374151" }}>·</span>
          <span>{project.linearTeamName ?? "Linear"}</span>
          {project.labelFilter && (
            <>
              <span style={{ color: "#374151" }}>·</span>
              <span>#{project.labelFilter}</span>
            </>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
