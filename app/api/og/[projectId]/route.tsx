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

const CHART_WIDTH = 780;
const CHART_HEIGHT = 210;
const SIDE_PANEL_WIDTH = 130;

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

  const backlogCount = project.cachedBacklogCount;
  const completedCount = project.cachedCompletedCount;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          padding: "52px 60px 44px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Header: app name + project info */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 28 }}>
          <div style={{ color: "#6b7280", fontSize: 14, letterSpacing: "0.1em", marginBottom: 10, display: "flex" }}>
            LINEAR HILL CHARTS
          </div>
          <div style={{ color: "#f9fafb", fontSize: 40, fontWeight: 700, lineHeight: 1.15, display: "flex" }}>
            {project.name}
          </div>
          {project.description && (
            <div style={{ color: "#9ca3af", fontSize: 17, marginTop: 6, display: "flex" }}>
              {project.description.length > 90
                ? project.description.slice(0, 90) + "…"
                : project.description}
            </div>
          )}
        </div>

        {/* Chart row: [backlog panel] [hill svg] [completed panel] */}
        <div style={{ display: "flex", flex: 1, alignItems: "stretch", gap: 16 }}>

          {/* Left panel: backlog count */}
          <div
            style={{
              width: SIDE_PANEL_WIDTH,
              minWidth: SIDE_PANEL_WIDTH,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111827",
              borderRadius: 12,
              border: "1px solid #1f2937",
              padding: "16px 8px",
            }}
          >
            <div style={{ color: "#f9fafb", fontSize: 44, fontWeight: 700, display: "flex" }}>
              {backlogCount}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 16, marginTop: 8, textAlign: "center", display: "flex" }}>
              not started
            </div>
          </div>

          {/* Hill chart */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {/* Relative container so identifier labels can be absolutely positioned over the SVG */}
            <div style={{ position: "relative", width: CHART_WIDTH, height: CHART_HEIGHT, display: "flex" }}>
              <svg
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                style={{ position: "absolute", top: 0, left: 0 }}
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

                {/* Issue dots — no <text> allowed in Satori SVG */}
                {project.issuePositions.map((pos) => {
                  const { x, y } = hillPositionToScreen(
                    pos.xPosition,
                    CHART_WIDTH,
                    CHART_HEIGHT
                  );
                  return (
                    <circle key={pos.issueId} cx={x} cy={y} r="8" fill="#8b5cf6" opacity="0.9" />
                  );
                })}
              </svg>

              {/* Identifier labels as absolutely positioned divs over the SVG */}
              {project.issuePositions.map((pos) => {
                if (!pos.issueIdentifier) return null;
                const { x, y } = hillPositionToScreen(
                  pos.xPosition,
                  CHART_WIDTH,
                  CHART_HEIGHT
                );
                const labelWidth = 96;
                return (
                  <div
                    key={pos.issueId}
                    style={{
                      position: "absolute",
                      left: x - labelWidth / 2,
                      top: y - 44,
                      width: labelWidth,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(10,10,10,0)",
                      borderRadius: 5,
                      padding: "3px 8px",
                      color: "#f9fafb",
                      fontSize: 20,
                      fontWeight: 700,
                    }}
                  >
                    {pos.issueIdentifier}
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 12,
                color: "#9ca3af",
                fontSize: 16,
              }}
            >
              <span>Figuring it out</span>
              <span>Making it happen</span>
            </div>
          </div>

          {/* Right panel: completed count */}
          <div
            style={{
              width: SIDE_PANEL_WIDTH,
              minWidth: SIDE_PANEL_WIDTH,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#111827",
              borderRadius: 12,
              border: "1px solid #1f2937",
              padding: "16px 8px",
            }}
          >
            <div style={{ color: "#f9fafb", fontSize: 44, fontWeight: 700, display: "flex" }}>
              {completedCount}
            </div>
            <div style={{ color: "#9ca3af", fontSize: 16, marginTop: 8, textAlign: "center", display: "flex" }}>
              completed
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid #1f2937",
            color: "#9ca3af",
            fontSize: 16,
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
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
