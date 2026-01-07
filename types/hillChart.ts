import { LinearIssue, IssuePosition } from "./issue";

export interface HillChartPoint {
  x: number;
  y: number;
}

export interface DraggableIssue extends LinearIssue {
  position: IssuePosition;
  hillPoint: HillChartPoint;
}
