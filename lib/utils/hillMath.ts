/**
 * Calculate Y position on hill curve given X position
 * Uses a bell curve formula to create the hill shape
 * @param x - Position from 0-100 (percentage)
 * @returns y - Height from 0-100 (percentage)
 */
export function calculateHillY(x: number): number {
  const normalized = x / 100;

  const sigma = 0.25;
  const peak = 0.5;

  const exponent = -Math.pow(normalized - peak, 2) / (2 * Math.pow(sigma, 2));
  const y = Math.exp(exponent);

  return y * 100;
}

/**
 * Generate SVG path data for the hill curve
 * @param width - Chart width in pixels
 * @param height - Chart height in pixels
 * @returns SVG path string
 */
export function generateHillPath(width: number, height: number): string {
  const points: Array<{ x: number; y: number }> = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const xPercent = (i / steps) * 100;
    const yPercent = calculateHillY(xPercent);

    const pixelX = (xPercent / 100) * width;
    const pixelY = height - (yPercent / 100) * height;

    points.push({ x: pixelX, y: pixelY });
  }

  if (points.length === 0) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}

/**
 * Convert screen X coordinate to hill position percentage
 * @param screenX - X coordinate in pixels
 * @param chartWidth - Total chart width in pixels
 * @returns Position percentage (0-100)
 */
export function screenToHillPosition(
  screenX: number,
  chartWidth: number
): number {
  const clampedX = Math.max(0, Math.min(screenX, chartWidth));
  return (clampedX / chartWidth) * 100;
}

/**
 * Convert hill position percentage to screen coordinates
 * @param xPosition - Position percentage (0-100)
 * @param chartWidth - Total chart width in pixels
 * @param chartHeight - Total chart height in pixels
 * @returns {x, y} coordinates in pixels
 */
export function hillPositionToScreen(
  xPosition: number,
  chartWidth: number,
  chartHeight: number
): { x: number; y: number } {
  const yPercent = calculateHillY(xPosition);

  return {
    x: (xPosition / 100) * chartWidth,
    y: chartHeight - (yPercent / 100) * chartHeight,
  };
}
